import GameSparks from 'gamesparks-sdk';

it('has GameSparks object', () => {
  const sdk = new GameSparks();
  expect(() => {
    sdk.send('', (e) => { throw(e.error); });
  }).toThrow(/NOT_INITIALISED/);
});
