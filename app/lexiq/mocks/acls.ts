export function mockLoader() {
  return {
    access: true,
    writable: true,
    policy: JSON.stringify(
      {
        acls: [{ action: "accept", src: ["*"], dst: ["*:*"] }],
        groups: {
          "group:admin": ["bb@coniferhg.com"],
        },
        tagOwners: {
          "tag:server": ["group:admin"],
        },
      },
      null,
      2,
    ),
  };
}
