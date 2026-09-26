Cardápio Digital - Lanchonete

Projeto acadêmico desenvolvido em TypeScript, com foco em Programação Orientada a Objetos (POO), geração dinâmica de interface, persistência com localStorage e gerenciamento de vendas.

Objetivo

O projeto simula um cardápio digital de uma lanchonete. O cliente pode visualizar os produtos, adicioná-los ao carrinho e enviar um pedido. O pedido fica pendente até que o administrador faça login e finalize a venda. Somente após a finalização o valor é acrescentado ao faturamento acumulado da sessão.

Funcionalidades

Cardápio gerado dinamicamente pelo TypeScript.

Produtos iniciais criados via código.

Produtos divididos em Bebida e Lanche.

Cálculo de preço final específico para cada tipo de produto.

Cadastro e exclusão de produtos pelo painel administrativo.

Persistência do cardápio utilizando localStorage.

Reconstrução das instâncias de Bebida e Lanche após recarregar a página.

Carrinho com controle de quantidade, remoção e total.

Envio de pedido para a lista de pedidos pendentes.

Login administrativo.

Finalização de vendas pelo administrador.

Faturamento acumulado atualizado somente após a venda ser finalizada.

Layout responsivo.

Estrutura do projeto

projeto/
├── index.html
├── style.css
├── tsconfig.json
├── src/
│ ├── app.ts
│ ├── models.ts
│ ├── storageService.ts
│ └── data/
│ └── produtosIniciais.ts
└── dist/
└── app.js

index.html

Contém a estrutura da página. O container do cardápio permanece vazio no HTML, pois os cards são gerados dinamicamente pelo TypeScript. Também contém os modais do carrinho e login e o painel administrativo.

style.css

Responsável pela aparência da aplicação, organização dos cards, modais, botões, painel administrativo e responsividade.

src/models.ts

Concentra as principais classes e conceitos de POO:

ProdutoRenderizavel

ItemCarrinho

Produto

Bebida

Lanche

Carrinho

Venda

src/data/produtosIniciais.ts

Cria os produtos iniciais utilizados quando ainda não existe um cardápio salvo no navegador.

src/storageService.ts

Responsável por salvar e recuperar os produtos utilizando localStorage.

src/app.ts

Integra as classes com a interface da página. Controla renderização, carrinho, login, cadastro e exclusão de produtos, pedidos pendentes e finalização de vendas.

Conceitos de POO aplicados

Interface

ProdutoRenderizavel funciona como contrato para os produtos.

Classe abstrata

Produto reúne os atributos e comportamentos comuns às especializações.

Herança

Bebida e Lanche utilizam extends Produto.

Polimorfismo

Bebida e Lanche implementam calcularPrecoFinal() e gerarHTML() de formas diferentes. O sistema pode trabalhar com objetos do tipo Produto e cada instância executa seu próprio comportamento.

Encapsulamento

Atributos internos são protegidos com private, e o acesso necessário ocorre por métodos e getters controlados.

readonly

O identificador do produto é somente leitura. Listas internas também utilizam readonly para proteger suas referências contra reatribuição.

static

Venda.faturamentoTotal pertence à classe Venda e acumula os valores das vendas finalizadas.

Regras de preço

Bebida

A bebida gelada recebe acréscimo de 10% sobre o preço base.

Lanche

Tamanho P: preço base - R$ 2,00, sem permitir valor negativo.

Tamanho M: mantém o preço base.

Tamanho G: preço base + R$ 5,00.

Fluxo de uma venda

Cliente escolhe os produtos
↓
Adiciona ao carrinho
↓
Envia o pedido
↓
Venda fica pendente
↓
Administrador faz login
↓
Confere o pedido
↓
Finaliza a venda
↓
Faturamento acumulado é atualizado

O faturamento não é atualizado quando o cliente apenas envia o pedido. O valor é acrescentado somente quando Venda.finalizar() é executado.

Persistência com localStorage

O cardápio é salvo no localStorage do navegador. Como o armazenamento guarda dados serializados e não preserva automaticamente os métodos das classes, os produtos recuperados são reconstruídos como instâncias de Bebida ou Lanche.

Assim, após atualizar a página, os produtos continuam disponíveis e recuperam comportamentos como calcularPrecoFinal() e gerarHTML().

Como executar

Certifique-se de possuir Node.js e TypeScript disponíveis no ambiente.

Abra o terminal na pasta do projeto.

Compile o TypeScript:

npx tsc

Abra a aplicação por um servidor local compatível com módulos JavaScript.

Acesse o index.html pelo servidor local.

Como o projeto utiliza type="module", é recomendável executá-lo por um servidor local em vez de abrir o arquivo HTML diretamente pelo sistema de arquivos.

Teste sugerido

Verifique se os produtos aparecem no cardápio.

Cadastre um novo produto no painel administrativo.

Atualize a página e confirme que o produto permanece.

Adicione produtos ao carrinho.

Envie o pedido.

Entre no painel administrativo.

Confirme que o pedido aparece como pendente.

Observe que o faturamento ainda não aumentou.

Finalize a venda.

Confirme que o pedido sai da lista de pendentes e o faturamento é atualizado.

Requisitos atendidos

Sprint 1

Lista de produtos gerada dinamicamente.

HTML inicial sem cards fixos.

Pelo menos três produtos criados via código.

Produto responsável por gerar seu próprio HTML.

Layout responsivo.

Persistência e reconstrução do cardápio com localStorage.

Sprint 2

Interface de produto.

Classe-base Produto.

Especializações Bebida e Lanche.

Herança e polimorfismo.

Identificador readonly.

Encapsulamento com private.

Classe Venda com lista privada.

Adição controlada de produtos.

Cálculo do total da venda.

Faturamento acumulado com membro static.

Faturamento alterado somente após a finalização.

Painel administrativo com pedidos pendentes, finalização e faturamento.

Observações

O faturamento acumulado e os pedidos pendentes são mantidos durante a sessão atual da página. A persistência exigida e implementada no projeto é a do cardápio por meio do localStorage.

Projeto acadêmico - Cardápio Digital em TypeScript.
