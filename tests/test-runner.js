(function () {
  const results = [];
  let pass = 0, fail = 0;

  function test(name, fn) {
    try { fn(); pass++; results.push({ name, ok: true }); }
    catch (e) { fail++; results.push({ name, ok: false, msg: e.message }); }
  }
  function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion échouée'); }
  function assertEqual(actual, expected, msg) {
    if (actual !== expected) throw new Error(`${msg || ''} attendu ${expected}, obtenu ${actual}`);
  }
  function assertDeep(actual, expected, msg) {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error(`${msg || ''} attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(actual)}`);
  }
  function report() {
    const el = document.getElementById('out') || document.body;
    el.innerHTML =
      `<h2 style="color:${fail === 0 ? 'green' : 'red'}">${fail === 0 ? '✅' : '❌'} ${pass} réussis, ${fail} échoués</h2>` +
      results.map(r =>
        `<div style="color:${r.ok ? 'green' : 'red'}">${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ' — ' + r.msg}</div>`
      ).join('');
    console.log(`${pass} réussis, ${fail} échoués`);
  }

  window.RoueTest = { test, assert, assertEqual, assertDeep, report };
})();
