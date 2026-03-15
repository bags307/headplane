const mockUser = {
  id: "1",
  name: "brian",
  displayName: "Brian Bagdasarian",
  email: "bb@coniferhg.com",
  createdAt: "2026-01-01T00:00:00Z",
  provider: "oidc",
  providerId: "https://auth.remodl.ai/realms/remodl/1fad5a9f-bb52-43c8-931b-b7f52e3205c5",
  profilePicUrl: undefined as string | undefined,
};

const mockNode = {
  id: "1",
  machineKey: "mkey:abc123",
  nodeKey: "nodekey:abc123",
  discoKey: "discokey:abc123",
  ipAddresses: ["100.64.0.1", "fd7a:115c:a1e0::1"],
  name: "macstudio",
  givenName: "macstudio",
  user: mockUser,
  lastSeen: new Date().toISOString(),
  expiry: null,
  createdAt: "2026-01-01T00:00:00Z",
  registerMethod: "REGISTER_METHOD_OIDC" as const,
  tags: [],
  online: true,
  approvedRoutes: [],
  availableRoutes: [],
  subnetRoutes: [],
};

export function mockLoader() {
  return {
    writable: true,
    oidc: {
      issuer: "https://auth.remodl.ai/realms/remodl",
    },
    roles: ["owner"],
    magic: "lexiq.local",
    users: [{ ...mockUser, machines: [mockNode] }],
    headscaleUsers: [{ id: "1", name: "Brian Bagdasarian", claimed: true }],
    userLinks: { "1": "1fad5a9f-bb52-43c8-931b-b7f52e3205c5" },
  };
}
