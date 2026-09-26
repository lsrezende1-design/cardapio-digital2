import { Bebida, Lanche } from '../models.js';
export const produtosIniciais = [
    new Bebida(1, 'Suco de Laranja', 8.0, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300', true),
    new Bebida(2, 'Refrigerante Lata', 6.0, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300', true),
    new Lanche(3, 'X-Salada Especial', 18.0, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', 'M'),
    new Lanche(4, 'Super X-Tudo', 24.0, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300', 'G'),
];
