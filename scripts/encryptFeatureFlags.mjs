import fs from 'fs';
import { v5 } from 'uuid';

const args = process.argv;
if (args.length < 3) {
  console.error(
    'Missing env:<dev|serenity|euphoria|main>: `node encryptFeatureFlags.mjs <dev|serenity|euphoria|main>`',
  );
  process.exit(1);
}

const env = args[2];

const envs = { develop: 'dev', serenity: 'serenity', euphoria: 'euphoria', main: 'main' };
const getEnv = () => {
  return envs[env] || 'dev';
};

const namespace = '32bf670d-a39e-46a7-8546-2a11d3c16b33';
const encryptConfig = async () => {
  try {
    const config = (
      await import(`./feature-flags/${getEnv()}/config.json`, {
        assert: { type: 'json' },
      })
    ).default;

    const flags = {};
    for (const flag of Object.entries(config)) {
      flags[v5(flag[0], namespace)] = flag[1];
    }

    fs.writeFile('src/assets/config/feature-flags.json', JSON.stringify(flags), function (err) {
      if (err) {
        console.log(err);
      }
    });
    return config;
  } catch (e) {
    console.error(e);
  }
};
encryptConfig();
