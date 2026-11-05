import { createApp } from './app.js';
import { config } from './config/index.js';

createApp().listen(config.port, () => {
  console.log(
    `Sparka API listening on :${config.port} (store=${config.storeDriver}, crm=${config.crmEnabled ? 'on' : 'off'})`
  );
});
