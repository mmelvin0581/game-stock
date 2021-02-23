import { Injectable } from '@nestjs/common';

const games = [
  {
    id: '1',
    name: 'Chess',
    image: 'https://media.giphy.com/media/iCZyBnPBLr0dy/giphy.gif',
    description: "It's chess...",
    price: 35,
    rating: Math.random(),
  },
  {
    id: '2',
    name: 'Monopoly',
    image: 'https://media.giphy.com/media/xN6zyKDFFHcNq/giphy.gif',
    description:
      "Buy property as you travel around the board. Don't flip the table when you lose.",
    price: 15,
    rating: Math.random(),
  },
  {
    id: '3',
    name: 'Scrabble',
    image: 'https://media.giphy.com/media/uk2PszmbquSVa/giphy.gif',
    description: 'Make words from other words.',
    price: 45,
    rating: Math.random(),
  },
];

@Injectable()
export class AppService {
  getAllGames = () => games;
  getGame = (id: string) => games.find((game) => game.id === id);
}
