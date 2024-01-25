import { chains } from 'chain-registry';
import Devnet from './sample/dev/dev.json';
import Euphoria from './sample/euphoria/euphoria.json';
import Serenity from './sample/serenity/serenity.json';

const testnetChains = [Devnet, Serenity, Euphoria];
const allChains = [...chains, ...testnetChains];

export { allChains };
