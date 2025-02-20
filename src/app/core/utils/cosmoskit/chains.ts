import { chains } from 'chain-registry';
import Devnet from './sample/dev/dev.json';
import Euphoria from './sample/euphoria/euphoria.json';
import Serenity from './sample/serenity/serenity.json';
import Main from './sample/main/main.json';

const testnetChains = [Devnet, Serenity, Euphoria, Main];
const allChains = [...chains, ...testnetChains];

export { allChains };
