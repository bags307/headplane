const mockUser = {
  id: "1",
  name: "brian",
  displayName: "Brian Bagdasarian",
  email: "bb@coniferhg.com",
  createdAt: "2026-01-01T00:00:00Z",
};

export function mockLoader() {
  return {
    config: true,
    isOidcEnabled: true,
  };
}

export function mockAuthKeysLoader() {
  return {
    access: true,
    currentSubject: "1fad5a9f-bb52-43c8-931b-b7f52e3205c5",
    keys: [
      {
        user: mockUser,
        preAuthKeys: [
          {
            id: "1",
            key: "hskey-preauth-abc123xxxxxxxxxxxxxxxxxxxx",
            user: mockUser,
            reusable: true,
            ephemeral: false,
            used: false,
            expiration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            aclTags: [],
          },
        ],
      },
    ],
    missing: [],
    selfServiceOnly: false,
    url: "http://localhost:8080",
    users: [mockUser],
  };
}

export function mockRestrictionsLoader() {
  return {
    access: true,
    writable: true,
    settings: {
      domains: ["coniferhg.com"],
      groups: ["/conifer-holdings"],
      users: [],
    },
  };
}
