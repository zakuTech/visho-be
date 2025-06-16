import post from './post';
import user from './user';

async function main() {
  await user();
  await post();
}


main();
