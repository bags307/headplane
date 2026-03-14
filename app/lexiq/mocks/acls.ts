export function mockLoader() {
  return {
    access: true,
    writable: true,
    policy: '{\n  "acls": [\n    { "action": "accept", "src": ["*"], "dst": ["*:*"] }\n  ]\n}',
  }
}
