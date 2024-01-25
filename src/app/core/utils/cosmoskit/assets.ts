import { assets } from 'chain-registry';
import AssetDevnet from './sample/dev/assets.json';
import AssetEuphoria from './sample/euphoria/assets.json';
import AssetSerenity from './sample/serenity/assets.json';

const testnetAssets = [AssetDevnet, AssetSerenity, AssetEuphoria];
const allAssets = [...assets, ...testnetAssets];

export { allAssets };
