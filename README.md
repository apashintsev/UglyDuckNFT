# Sample Hardhat Project

1. Чтобы установить зависимости нужно выполнить команду

### `yarn install`

2. Чтобы выложить контракт оператора в Mainnet BSC
   2.1 Сначала прописать актуальные адреса деплоера, нфт и стейка в файле scripts/deployOperator.ts
   2.2 Прописать сид-фразу кошелька деплоера в файле secrets.json (есть пример secrets.example.json)
   2.3 Выполнить команду для деплоя в тестнет

### `npx hardhat run --network testnetBSC scripts/deployOperator.ts`

3. Выполнить команду для деплоя в мейннет

### `npx hardhat run --network mainnetBSC scripts/deployOperator.ts`
