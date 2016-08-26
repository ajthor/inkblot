'use strict';
import path from 'path';
import ChildProcess from 'child_process';
import Promise from 'bluebird';
import getStream from 'get-stream';

import test from 'ava';

const cliPath = path.resolve(__dirname, '../bin/cli.js');

const callCli = (args, cb) => {
  let childProc;
  let stdout;
  let stderr;

  const proc = new Promise(resolve => {
    childProc = ChildProcess.spawn(process.execPath, [cliPath, ...args], {stdio: [null, 'pipe', 'pipe']});

    childProc.on('close', (code, signal) => {
      if (code) {
        const err = new Error('Test exited with a non-zero exit code:', code);
        err.code = code;
        err.signal = signal;
        resolve(err);
        return;
      }

      resolve(code);
    });

    stdout = getStream(childProc.stdout);
    stderr = getStream(childProc.stderr);
  });

  Promise.all([proc, stdout, stderr]).then(args => {
    cb.apply(null, args);
  });

  return childProc;
};

test.cb('cli exists and is callable', t => {
  callCli(['-h'], t.end);
});

// TEST { cli call tests }
test.cb('will display help if the -h flag is passed', t => {
  callCli(['-h'], (err, stdout) => {
    t.ifError(err, 'No error from help.');
    t.regex(stdout, /Usage/, 'Contains \'Usage\'.');
    t.end();
  });
});
// END
