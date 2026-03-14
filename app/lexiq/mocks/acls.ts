export function mockLoader() {
  return {
    policy: '{\n  "acls": [\n    { "action": "accept", "src": ["*"], "dst": ["*:*"] }\n  ]\n}',
    writable: true,
  }
}
