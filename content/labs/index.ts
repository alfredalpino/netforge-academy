import type { LabSpec } from "@/simulation/grading/lab-schema";
import { BASIC_LAN_LAB } from "./basic-lan";
import { VLAN_SEGMENT_LAB } from "./vlan-segment";
import { ARP_ICMP_LAB } from "./arp-icmp";
import { TRUNK_VLAN_LAB } from "./trunk-vlan";
import { STATIC_ROUTE_LAB } from "./static-route";
import { OSPF_BASIC_LAB } from "./ospf-basic";
import { DHCP_BASIC_LAB } from "./dhcp-basic";
import { STP_LOOP_LAB } from "./stp-loop";
import { ACL_STANDARD_LAB } from "./acl-standard";
import { INTER_VLAN_ROUTING_LAB } from "./inter-vlan-routing";
import { ACL_EXTENDED_LAB } from "./acl-extended";
import { INTER_VLAN_SVI_LAB } from "./inter-vlan-svi";
import { NAT_BASIC_LAB } from "./nat-basic";
import { ACL_TCP_LAB } from "./acl-tcp";

/** Graded browser labs — single registry for simulator deep links and catalog pages. */
export const LAB_CATALOG: Record<string, LabSpec> = {
  "basic-lan": BASIC_LAN_LAB,
  "vlan-segment": VLAN_SEGMENT_LAB,
  "arp-icmp": ARP_ICMP_LAB,
  "trunk-vlan": TRUNK_VLAN_LAB,
  "static-route": STATIC_ROUTE_LAB,
  "ospf-basic": OSPF_BASIC_LAB,
  "dhcp-basic": DHCP_BASIC_LAB,
  "stp-loop": STP_LOOP_LAB,
  "acl-standard": ACL_STANDARD_LAB,
  "inter-vlan-routing": INTER_VLAN_ROUTING_LAB,
  "acl-extended": ACL_EXTENDED_LAB,
  "inter-vlan-svi": INTER_VLAN_SVI_LAB,
  "nat-basic": NAT_BASIC_LAB,
  "acl-tcp": ACL_TCP_LAB,
};

export const LAB_LIST: LabSpec[] = Object.values(LAB_CATALOG);

export {
  BASIC_LAN_LAB,
  VLAN_SEGMENT_LAB,
  ARP_ICMP_LAB,
  TRUNK_VLAN_LAB,
  STATIC_ROUTE_LAB,
  OSPF_BASIC_LAB,
  DHCP_BASIC_LAB,
  STP_LOOP_LAB,
  ACL_STANDARD_LAB,
  INTER_VLAN_ROUTING_LAB,
  ACL_EXTENDED_LAB,
  INTER_VLAN_SVI_LAB,
  NAT_BASIC_LAB,
  ACL_TCP_LAB,
};
