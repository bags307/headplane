const mockUser = {
  id: "1",
  name: "brian",
  displayName: "Brian Bagdasarian",
  email: "bb@coniferhg.com",
  createdAt: "2026-01-01T00:00:00Z",
};

const mockNodes = [
  {
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
  },
  {
    id: "2",
    machineKey: "mkey:def456",
    nodeKey: "nodekey:def456",
    discoKey: "discokey:def456",
    ipAddresses: ["100.64.0.2", "fd7a:115c:a1e0::2"],
    name: "dev-server",
    givenName: "dev-server",
    user: mockUser,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiry: null,
    createdAt: "2026-01-15T00:00:00Z",
    registerMethod: "REGISTER_METHOD_AUTH_KEY" as const,
    tags: ["tag:server"],
    online: false,
    approvedRoutes: ["10.0.0.0/24"],
    availableRoutes: ["10.0.0.0/24"],
    subnetRoutes: ["10.0.0.0/24"],
  },
];

const mockPopulatedNodes = mockNodes.map((node) => ({
  ...node,
  routes: node.availableRoutes,
  expired: false,
  customRouting: {
    exitRoutes: [],
    exitApproved: false,
    subnetApprovedRoutes: node.approvedRoutes,
    subnetWaitingRoutes: [],
  },
}));

export function mockLoader() {
  return {
    agent: "nodekey:abc123",
    headscaleUserId: "1",
    magic: "lexiq.local",
    nodes: mockNodes,
    populatedNodes: mockPopulatedNodes,
    preAuth: true,
    publicServer: "http://localhost:8080",
    server: "http://localhost:8080",
    supportsNodeOwnerChange: false,
    users: [mockUser],
    writable: true,
  };
}
