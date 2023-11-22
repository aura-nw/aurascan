# Aurascan

The next generation blockchain explorer for Aura Network.

## Getting Started

To run Aurascan locally, you need to have Node.js and Angular CLI installed on your machine. You also need to clone this repository and install the dependencies.

```bash
git clone https://github.com/aura-nw/aurascan.git
cd aurascan
npm install
```

## Configuration

You can configure Aurascan by editing the `src/assets/config/config.json` file. 

You can specify the chain name, RPC endpoint, LCD endpoint, chain ID, and other options. 

### Feature config


List of features which you can configure:
```
  CW20
  CW721
  CW4973
  STATISTICS
  FEE_GRANT
  ACCOUNT_BOUND
  COMMUNITY_POOL
  PROFILE
  EXPORT_CSV
  TOP_STATISTICS
```

To enable any feature above, please add the feature name to the config file.

Example:
```json
{
  ...
  "chainConfig": {
    ...
    "features": ["CW20", "CW721"]
    ...
  }
  ...
}
```

## Development Server

To start a development server, run the following command:

```bash
ng serve
```

Then, navigate to http://localhost:4200/ to see the app in action. The app will automatically reload if you change any of the source files.

## Build

To build the project for production, run the following command:

```bash
ng build --prod
```

The build artifacts will be stored in the `dist/` directory.

 ## Further Help

To get more help on the Angular CLI, use `ng help` or check out the [Angular CLI Overview and Command Reference](^1^) page.