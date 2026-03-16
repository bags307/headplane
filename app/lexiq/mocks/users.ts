const mockOidcUser = {
  id: "1",
  name: "brian",
  displayName: "Brian Bagdasarian",
  email: "bb@coniferhg.com",
  createdAt: "2026-01-01T00:00:00Z",
  provider: "oidc",
  providerId: "https://auth.remodl.ai/realms/remodl/1fad5a9f-bb52-43c8-931b-b7f52e3205c5",
  profilePicUrl: undefined as string | undefined,
};

const mockLocalUser = {
  id: "2",
  name: "admin-cli",
  displayName: "Admin CLI",
  email: undefined as string | undefined,
  createdAt: "2026-01-10T00:00:00Z",
  provider: undefined as string | undefined,
  providerId: undefined as string | undefined,
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
  user: mockOidcUser,
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
    canViewUsers: true,
    orgName: "conifer-holdings",
    oidc: {
      issuer: "https://auth.remodl.ai/realms/remodl",
    },
    roles: ["owner", "no-oidc"],
    magic: "lexiq.local",
    users: [
      { ...mockOidcUser, machines: [mockNode] },
      { ...mockLocalUser, machines: [] },
    ],
    headscaleUsers: [
      { id: "1", name: "Brian Bagdasarian", claimed: true },
      { id: "2", name: "admin-cli", claimed: false },
    ],
    userLinks: {
      "1": "1fad5a9f-bb52-43c8-931b-b7f52e3205c5",
    },
  };
}
