#!/usr/bin/env node

'use strict';

var concat = require('concat-stream');
var fileType = require('file-type');
var PhaxioAPI = require('phaxio-api');
var streamifier = require('streamifier');

var program = require('commander');

program
  .version('1.0.0')
  .option('-p, --phone-number <number>', 'The phone number to send the fax to')
  .option('-k, --key <key>', 'A Phaxio key')
  .option('-s, --secret <secret>', 'A Phaxio secret')
  .option('-c, --callback-url <url>', 'A Phaxio callback URL')
  .parse(process.argv);

if (!program.phoneNumber) {
  console.error('Specify a phone number.');

  process.exit(1);
}

var key = program.key || process.env.PHAXIO_KEY;
var secret = program.secret || process.env.PHAXIO_SECRET;
var callbackUrl = program.callbackUrl || process.env.PHAXIO_CALLBACK_URL;

if (!key || !secret) {
  console.error('Specify a key or secret.');

  process.exit(1);
}

var phaxio = new PhaxioAPI({
  api_key: key,
  api_secret: secret,
  callback_url: callbackUrl
});

process.stdin.pipe(concat(function (buffer) {
  var type = fileType(buffer) || {ext: 'txt', mime: 'text/plain'};

  phaxio.send(program.phoneNumber, {
    stream: streamifier.createReadStream(buffer),
    contentType: type.mime,
    filename: 'file.' + type.ext,
    knownLength: buffer.length
  }).then(function (response) {
    console.log('phaxio response', response);
  }) .catch(function (err) {
    console.log('phaxio err', err);
  });
}));
