import test from 'ava';
import getPort from 'get-port';
import got from 'got';
import {
  createIapetus,
} from '../../../src/factories/createIapetus';

test('creates HTTP server with /metrics endpoint', async (t) => {
  const port = await getPort();

  const iapetus = createIapetus({
    detectKubernetes: false,
    port,
  });

  const response = await got('http://127.0.0.1:' + String(port) + '/metrics', {
    resolveBodyOnly: true,
    throwHttpErrors: false,
  });

  t.true(response.includes('nodejs_version_info'));

  await iapetus.stop();
});
