const mockUser = {
  id: "1",
  name: "brian",
  displayName: "Brian Bagdasarian",
  email: "bb@coniferhg.com",
  createdAt: "2026-01-01T00:00:00Z",
};

// HostInfo for the agent node (macstudio) — HeadplaneAgent: true marks it as the agent
const macstudioHostInfo = {
  HeadplaneAgent: true,
  IPNVersion: "1.78.3-t4b3d5678e",
  OS: "macOS",
  OSVersion: "15.3.1",
  Hostname: "macstudio",
  Machine: "arm64",
  GoArch: "arm64",
  GoVersion: "go1.22.3",
  Distro: "",
  NetInfo: {
    MappingVariesByDestIP: false,
    HairPinning: true,
    WorkingIPv6: true,
    WorkingUDP: true,
    HavePortMap: true,
    PreferredDERP: 20,
    LinkType: "wired",
  },
  Services: [
    { Proto: "peerapi4", Port: 60618 },
    { Proto: "peerapi6", Port: 60618 },
  ],
};

// HostInfo for dev-server — regular node, SSH advertised
const devServerHostInfo = {
  HeadplaneAgent: false,
  IPNVersion: "1.76.1-t9a2c1234b",
  OS: "linux",
  OSVersion: "6.6.30",
  Hostname: "dev-server",
  Machine: "x86_64",
  GoArch: "amd64",
  GoVersion: "go1.22.1",
  Distro: "ubuntu",
  DistroVersion: "24.04",
  DistroCodeName: "noble",
  NetInfo: {
    WorkingIPv6: false,
    WorkingUDP: true,
    PreferredDERP: 20,
    LinkType: "wired",
  },
  Services: [
    { Proto: "peerapi4", Port: 41641 },
    { Proto: "tcp", Port: 22, Description: "ssh" },
  ],
};

const mockStats: Record<string, typeof macstudioHostInfo | typeof devServerHostInfo> = {
  "nodekey:abc123": macstudioHostInfo,
  "nodekey:def456": devServerHostInfo,
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
    online: true,
    approvedRoutes: ["10.0.0.0/24"],
    availableRoutes: ["10.0.0.0/24"],
    subnetRoutes: ["10.0.0.0/24"],
  },
];

const mockPopulatedNodes = mockNodes.map((node) => ({
  ...node,
  routes: node.availableRoutes,
  hostInfo: mockStats[node.nodeKey],
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
