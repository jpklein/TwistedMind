import GameSparks from 'gamesparks-sdk';
import CryptoJS from 'crypto-js';
import { call } from 'redux-saga/effects';

const sdk = new GameSparks();

// it('has the GameSparks sdk', () => {
//   expect(() => {
//     sdk.send('', (e) => { throw(e.error); });
//   }).toThrow(/NOT_INITIALISED/);
// });

// it('initializes the sdk against preview servers', () => {
//   expect(() => {
//     const onNonce = (n) => {
//       throw(n);
//       return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(n, 'bv7XLbgfeKWviKsfw4Uu2rUc64ncn61S'));
//     };
//     const onInit = () => {
//       throw("Initialized");
//     };
//     const onMessage = (m) => {
//       throw(JSON.stringify(m));
//     };
//     sdk.initPreview({
//       key: 'h313710gdMs0',
//       onNonce: onNonce,
//       onInit: onInit,
//       onMessage: onMessage
//     });
//   }).toThrow(/YO/);
// });

// function* initSdk() {
//   const onNonce = (n) => {
//     throw(n);
//     return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(n, 'bv7XLbgfeKWviKsfw4Uu2rUc64ncn61S'));
//   };
//   const onInit = () => {
//     throw("Initialized");
//   };
//   const onMessage = (m) => {
//     throw(JSON.stringify(m));
//   };
//   yield call(sdk.initPreview, {
//     key: 'h313710gdMs0',
//     onNonce: onNonce,
//     onInit: onInit,
//     onMessage: onMessage
//   });
// }
//
// it('initializes the sdk against preview servers', () => {
//   expect(() => {
//     const gen = initSdk();
//     gen.next().done;
//   }).toThrow(/YO/);
// });

it('initializes the sdk against preview servers', () => {
  expect(() => {
    const onNonce = (n) => {
      throw(JSON.stringify(n));
      return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(n, 'bv7XLbgfeKWviKsfw4Uu2rUc64ncn61S'));
    };
    const onInit = () => {
      throw("Initialized");
    };
    const onMessage = (m) => {
      throw(JSON.stringify(m));
    };
    const gen = call(sdk.initPreview, {
      key: 'h313710gdMs0',
      onNonce: onNonce,
      onInit: onInit,
      onMessage: onMessage
    });
    gen.next();
  }).toThrow(/SOMETHING/);
});
