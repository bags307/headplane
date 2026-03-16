import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import Code from "~/components/Code";
import Notice from "~/components/Notice";
import type { LoadContext } from "~/server";
import { Capabilities } from "~/server/web/roles";
import cn from "~/utils/cn";

import ManageDomains from "./components/manage-domains";
import ManageNS from "./components/manage-ns";
import ManageRecords from "./components/manage-records";
import RenameTailnet from "./components/rename-tailnet";
import ToggleMagic from "./components/toggle-magic";
import { dnsAction } from "./dns-actions";

// We do not want to expose every config value
export async function loader({ request, context }: LoaderFunctionArgs<LoadContext>) {
  if (process.env.MOCK_MODE) {
    const { mockLoader } = await import("~/lexiq/mocks/dns");
    return mockLoader();
  }
  if (!context.hs.readable()) {
    throw new Error("No configuration is available");
  }

  const principal = await context.auth.require(request);
  const check = context.auth.can(principal, Capabilities.read_network);
  if (!check) {
    throw new Error(
      "You do not have permission to view this page. Please contact your administrator.",
    );
  }

  const writablePermission = context.auth.can(principal, Capabilities.write_network);

  const config = context.hs.c!;
  const dns = {
    prefixes: config.prefixes,
    magicDns: config.dns.magic_dns,
    baseDomain: config.dns.base_domain,
    nameservers: config.dns.nameservers.global,
    splitDns: config.dns.nameservers.split,
    searchDomains: config.dns.search_domains,
    overrideDns: config.dns.override_local_dns,
    extraRecords: context.hs.d,
  };

  return {
    ...dns,
    access: writablePermission,
    writable: context.hs.writable(),
  };
}

export async function action(data: ActionFunctionArgs) {
  return dnsAction(data);
}

const card = cn(
  "rounded-lg border border-gray-200 bg-white p-5",
  "dark:border-gray-700 dark:bg-gray-900",
);

export default function Page() {
  const data = useLoaderData<typeof loader>();

  const allNs: Record<string, string[]> = {};
  for (const key of Object.keys(data.splitDns)) {
    allNs[key] = data.splitDns[key];
  }
  allNs.global = data.nameservers;

  const isDisabled = data.access === false || data.writable === false;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="mb-1.5 text-2xl font-medium">DNS</h1>

      {!data.writable && (
        <Notice>
          The Headscale configuration is read-only. You cannot make changes to the configuration
        </Notice>
      )}
      {!data.access && (
        <Notice>
          Your permissions do not allow you to modify the DNS settings for this tailnet.
        </Notice>
      )}

      <div className={card}>
        <RenameTailnet isDisabled={isDisabled} name={data.baseDomain} />
      </div>

      <div className={card}>
        <h2 className="mb-2 text-base font-semibold">Magic DNS</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Automatically register domain names for each device on the tailnet. Devices will be
          accessible at <Code>[device].{data.baseDomain}</Code> when Magic DNS is enabled.
        </p>
        <ToggleMagic isDisabled={isDisabled} isEnabled={data.magicDns} />
      </div>

      <div className={card}>
        <ManageNS isDisabled={isDisabled} nameservers={allNs} overrideLocalDns={data.overrideDns} />
      </div>

      <div className={card}>
        <ManageRecords isDisabled={isDisabled} records={data.extraRecords} />
      </div>

      <div className={card}>
        <ManageDomains
          isDisabled={isDisabled}
          magic={data.magicDns ? data.baseDomain : undefined}
          searchDomains={data.searchDomains}
        />
      </div>
    </div>
  );
}
