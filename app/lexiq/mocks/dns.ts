export function mockLoader() {
  return {
    access: true,
    writable: true,
    prefixes: {
      v4: "100.64.0.0/10",
      v6: "fd7a:115c:a1e0::/48",
      allocation: "sequential",
    },
    magicDns: true,
    baseDomain: "lexiq.local",
    nameservers: ["1.1.1.1", "1.0.0.1"],
    splitDns: {} as Record<string, string[]>,
    searchDomains: [],
    overrideDns: false,
    extraRecords: [],
  };
}
