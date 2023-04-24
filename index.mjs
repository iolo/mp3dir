import { main } from './lib/index.mjs';

main(process.argv)
  .then(console.log)
  .catch(console.err);
