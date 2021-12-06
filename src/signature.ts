/* eslint-disable @typescript-eslint/no-explicit-any */
import { HmacSHA1, enc } from 'crypto-js';

export const requestTokenSignature = ({
  method,
  apiUrl,
  callbackUrl,
  consumerKey,
  consumerSecret
}: {
  method: string;
  apiUrl: string;
  callbackUrl: string;
  consumerKey: string;
  consumerSecret: string;
}): string => {
  const params = {
    oauth_consumer_key: consumerKey,
    oauth_version: '1.0',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_callback: callbackUrl,
    oauth_timestamp: (Date.now() / 1000).toFixed(),
    oauth_nonce: Math.random()
      .toString(36)
      .replace(/[^a-z]/, '')
      .substr(2)
  };

  return makeSignature(params, method, apiUrl, consumerSecret);
};

export const accessTokenSignature = ({
  consumerKey,
  consumerSecret,
  oauthToken,
  oauthVerifier,
  method,
  apiUrl
}: {
  method: string;
  apiUrl: string;
  consumerKey: string;
  consumerSecret: string;
  oauthToken: string;
  oauthVerifier: string;
}): string => {
  const params = {
    oauth_consumer_key: consumerKey,
    oauth_version: '1.0',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_token: oauthToken,
    oauth_verifier: oauthVerifier,
    oauth_timestamp: (Date.now() / 1000).toFixed(),
    oauth_nonce: Math.random()
      .toString(36)
      .replace(/[^a-z]/, '')
      .substr(2)
  };

  return makeSignature(params, method, apiUrl, consumerSecret);
};

export const createSignature = ({
  consumerKey,
  consumerSecret,
  oauthToken,
  oauthTokenSecret,
  method,
  apiUrl,
  qs
}: {
  method: string;
  apiUrl: string;
  qs?: Record<string, string>;
  consumerKey: string;
  consumerSecret: string;
  oauthToken: string;
  oauthTokenSecret: string;
}): string => {
  if (!qs) {
    qs = {};
  }
  for (const key in qs) {
    qs[key] = encodeURIComponent(qs[key]);
  }
  const params = {
    ...qs,
    oauth_consumer_key: consumerKey,
    oauth_version: '1.0',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_token: oauthToken,
    oauth_timestamp: (Date.now() / 1000).toFixed(),
    oauth_nonce: Math.random()
      .toString(36)
      .replace(/[^a-z]/, '')
      .substr(2)
  };

  return makeSignature(
    params,
    method,
    apiUrl,
    consumerSecret,
    oauthTokenSecret
  );
};

const makeSignature = (
  params: Record<string, string>,
  method: string,
  apiUrl: string,
  consumerSecret: string,
  oauthTokenSecret?: string
) => {
  const paramsBaseString = Object.keys(params)
    .sort()
    .reduce(
      (prev: string, key: string) => (prev += `&${key}=${params[key]}`),
      ''
    )
    .substr(1);

  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(
    apiUrl
  )}&${encodeURIComponent(paramsBaseString)}`;

  const signingKey = `${encodeURIComponent(consumerSecret)}&${
    oauthTokenSecret ? encodeURIComponent(oauthTokenSecret) : ''
  }`;

  const oauth_signature = enc.Base64.stringify(
    HmacSHA1(signatureBaseString, signingKey)
  );

  const paramsWithSignature: Record<string, string> = {
    ...params,
    oauth_signature: encodeURIComponent(oauth_signature)
  };

  return Object.keys(paramsWithSignature)
    .sort()
    .reduce((prev: string, el: string) => {
      return (prev += `,${el}="${paramsWithSignature[el]}"`);
    }, '')
    .substr(1);
};
