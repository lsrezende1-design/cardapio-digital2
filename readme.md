# Cardápio Digital --- Sistema de Gestão de Vendas

Projeto desenvolvido em **TypeScript**, utilizando conceitos de
**Programação Orientada a Objetos (POO)**. O sistema mantém o cardápio
dinâmico da Sprint 1 e acrescenta, na Sprint 2, carrinho, vendas, painel
administrativo, encapsulamento, herança, polimorfismo, interfaces e
membros estáticos.

## Funcionalidades

O cliente pode visualizar os produtos do cardápio, escolher opções
específicas e adicioná-los ao carrinho. Para os lanches, é possível
escolher os tamanhos P, M ou G. Para as bebidas, é possível escolher sem
gelo ou com gelo.

O administrador pode entrar na área de gestão, cadastrar e excluir
produtos, visualizar pedidos pendentes e finalizar vendas. Quando uma
venda é finalizada, seu valor é acrescentado ao faturamento acumulado e
seu registro é salvo.

## Estrutura do projeto

```text
cardapio-digital2/
├── index.html
├── style.css
├── tsconfig.json
├── readme.md
├── src/
│   ├── app.ts
│   ├── models.ts
│   ├── storageService.ts
│   └── data/
│       └── produtosIniciais.ts
└── dist/
    ├── app.js
    ├── models.js
    ├── storageService.js
    └── data/
        └── produtosIniciais.js
```

Os arquivos `.ts` dentro de `src` são os arquivos-fonte do projeto. Os
arquivos `.js` de `dist` são gerados pela compilação do TypeScript.

## Organização das classes

### ProdutoRenderizavel

Interface que define o contrato básico dos produtos. Um produto
renderizável possui `id`, `nome` e os métodos `calcularPrecoFinal()` e
`gerarHTML()`.

### Produto

Classe abstrata que implementa `ProdutoRenderizavel` e reúne os dados
comuns aos produtos, como identificador, nome, preço-base e imagem. O
`id` é `readonly`. Os métodos `calcularPrecoFinal()` e `gerarHTML()` são
abstratos e devem ser implementados pelas classes filhas.

### Bebida

Classe que herda de `Produto`. Sem gelo mantém o preço-base; com gelo
acrescenta **R\$ 1,00**. A própria classe implementa
`calcularPrecoFinal()` e `gerarHTML()` de acordo com suas regras.

### Lanche

Classe que herda de `Produto`. O tamanho P custa preço-base menos **R\$
2,00**, M mantém o preço-base e G acrescenta **R\$ 5,00**. A própria
classe implementa `calcularPrecoFinal()` e `gerarHTML()` de acordo com
suas regras.

### Cardapio

Classe responsável por gerenciar a coleção de produtos. Centraliza
definir, adicionar, remover, procurar pelo `id`, consultar os produtos e
obter a quantidade cadastrada. Assim, o `app.ts` não precisa manipular
diretamente o array interno.

### Carrinho

Responsável pelos itens escolhidos pelo cliente. Sua lista é
`private readonly` e a classe controla adição, quantidade, remoção e
limpeza.

O total trabalha com o tipo comum `Produto` e chama
`produto.calcularPrecoFinal()`. O objeto armazenado pode ser uma
`Bebida` ou um `Lanche`, e a implementação correspondente ao objeto
concreto é executada.

### Venda

Representa uma venda. Sua lista interna é `Produto[]`, podendo conter
objetos concretos como `Bebida` e `Lanche`. O getter `total` percorre
essa coleção e chama `calcularPrecoFinal()` em cada `Produto`. Assim, a
`Venda` não precisa conhecer a regra específica de cada subclasse: cada
objeto concreto responde com sua própria implementação.

A classe também possui o membro `static` responsável pelo faturamento
acumulado. O faturamento aumenta quando `finalizar()` é executado.

### StorageService

Responsável pela persistência no `localStorage`. Salva produtos e vendas
finalizadas. Ao carregar a aplicação, os produtos são reconstruídos como
objetos `Bebida` ou `Lanche`. Os pedidos pendentes permanecem apenas
durante a sessão.

## Produtos iniciais

Quando ainda não existem produtos salvos, o sistema utiliza
`produtosIniciais.ts`, com quatro produtos criados diretamente em
TypeScript: Suco de Laranja, Refrigerante Lata, X-Salada Especial e
Super X-Tudo.

Não é utilizado arquivo JSON externo como fonte dos produtos.
`JSON.stringify()` e `JSON.parse()` são usados apenas para serializar e
recuperar dados do `localStorage`.

## Programação Orientada a Objetos

### Interface

`ProdutoRenderizavel` define o contrato que deve ser seguido pelos
produtos renderizáveis.

### Herança

`Bebida` e `Lanche` herdam características comuns da classe abstrata
`Produto`.

### Polimorfismo

`Bebida` e `Lanche` fornecem implementações próprias de
`calcularPrecoFinal()` e `gerarHTML()`. Essas implementações diferentes
**possibilitam** o comportamento polimórfico.

O polimorfismo fica evidente quando outras partes do sistema trabalham
com esses objetos pelo tipo comum `Produto`, sem precisar decidir
manualmente se o objeto é uma `Bebida` ou um `Lanche`.

No `Carrinho`:

```ts
item.produto.calcularPrecoFinal();
```

`item.produto` é tratado como `Produto`, mas o objeto concreto pode ser
`Bebida` ou `Lanche`. Em tempo de execução, é utilizada a implementação
correspondente ao objeto real.

Na `Venda`:

```ts
private readonly produtos: Produto[] = [];

get total(): number {
  return this.produtos.reduce(
    (soma, produto) => soma + produto.calcularPrecoFinal(),
    0
  );
}
```

A `Venda` trabalha com uma coleção de `Produto`, que pode conter
instâncias de `Bebida` e `Lanche`. Ao chamar
`produto.calcularPrecoFinal()`, cada objeto executa sua própria regra.

A renderização do cardápio segue o mesmo princípio ao trabalhar com
objetos do tipo `Produto` e chamar:

```ts
produto.gerarHTML();
```

Portanto, o polimorfismo não está apenas no fato de as subclasses
possuírem implementações diferentes. Ele é observado quando o sistema
trata essas instâncias pelo tipo comum `Produto` e, ao chamar o mesmo
método, obtém automaticamente o comportamento correspondente ao objeto
concreto.

### Encapsulamento

Atributos internos são protegidos com `private`, e o acesso ou alteração
acontece por métodos e getters controlados.

### readonly

O `id` do produto é `readonly`. As listas internas de `Carrinho` e
`Venda` também utilizam `readonly` na referência, evitando sua
substituição direta.

### static

O faturamento acumulado pertence à classe `Venda`, e não a uma venda
específica. Por isso é armazenado em um membro `static`.

## Fluxo principal

1.  A aplicação carrega os produtos do `localStorage`.
2.  Se não houver produtos salvos, utiliza `produtosIniciais`.
3.  O `Cardapio` recebe e gerencia os produtos.
4.  Cada produto gera seu próprio card HTML.
5.  O cliente escolhe as opções e adiciona produtos ao `Carrinho`.
6.  Ao enviar o pedido, é criada uma `Venda`.
7.  A venda fica como pedido pendente.
8.  O administrador visualiza e finaliza a venda.
9.  `Venda.finalizar()` acrescenta o total ao faturamento.
10. A venda finalizada é salva no `localStorage`.
11. Ao recarregar, as vendas finalizadas são recuperadas e o faturamento
    é reconstruído.

## Requisitos atendidos

### Sprint 1

- cardápio gerado dinamicamente pelo TypeScript;
- HTML inicial sem produtos escritos manualmente;
- produtos representados por classes;
- quatro produtos iniciais criados por código;
- gerenciamento pela classe `Cardapio`;
- persistência com `localStorage`;
- cards em grid responsivo.

### Sprint 2

- interface implementada;
- classe-base abstrata `Produto`;
- classes filhas `Bebida` e `Lanche`;
- herança;
- implementações específicas de `calcularPrecoFinal()` e `gerarHTML()`
  nas subclasses;
- **uso polimórfico de objetos do tipo `Produto` no `Carrinho`, na
  `Venda` e na renderização do cardápio**;
- `private`, `readonly` e `static`;
- classe `Venda` e lista interna protegida;
- cálculo do total pelos próprios produtos;
- finalização de venda e faturamento acumulado;
- painel administrativo;
- pedidos pendentes e histórico de vendas finalizadas.

## Compilação

Na pasta principal do projeto:

```bash
npx tsc
```

O TypeScript compila os arquivos de `src` e gera os arquivos JavaScript
utilizados pelo navegador em `dist`.

## Observação

O projeto foi mantido propositalmente com uma estrutura simples,
priorizando os conceitos estudados de TypeScript e Programação Orientada
a Objetos.
