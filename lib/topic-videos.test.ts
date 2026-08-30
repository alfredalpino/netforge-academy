import { describe, expect, it } from "vitest";
import {
  getAllTopics,
  getRelatedTopics,
  getTopicBySlug,
  getTopicsForModule,
  getTopicsForPhase,
  hasTopicVideo,
  resolveTopicSlug,
  TOPIC_VIDEOS,
} from "./topic-videos";

describe("resolveTopicSlug", () => {
  const cases: Array<{ label: string; slug: string }> = [
    { label: "LAN", slug: "lan" },
    { label: "local area network", slug: "lan" },
    { label: "VLAN", slug: "vlan" },
    { label: "VLANs", slug: "vlan" },
    { label: "OSPF", slug: "ospf-part-1" },
    { label: "DNS", slug: "dns" },
    { label: "DHCP", slug: "dhcp" },
    { label: "Subnetting", slug: "subnetting" },
    { label: "STP", slug: "stp" },
    { label: "OSI & TCP/IP models", slug: "osi-model" },
    { label: "Encapsulation/decapsulation", slug: "encapsulation" },
    { label: "802.1Q", slug: "trunk-8021q" },
    { label: "Inter-VLAN routing", slug: "inter-vlan-routing" },
    { label: "ARP", slug: "life-of-a-packet" },
    { label: "TCP, UDP", slug: "tcp-udp" },
    { label: "Static routing", slug: "static-routing" },
    { label: "NAT", slug: "nat" },
    { label: "SSH & virtual machines", slug: "ssh" },
    { label: "Collision & broadcast domains", slug: "lan" },
    { label: "Access/trunk ports", slug: "vlan" },
  ];

  it.each(cases)("maps %s → %s", ({ label, slug }) => {
    expect(resolveTopicSlug(label)).toBe(slug);
  });

  it("returns undefined for labels with no matching topic", () => {
    expect(resolveTopicSlug("quantum networking")).toBeUndefined();
    expect(resolveTopicSlug("")).toBeUndefined();
  });

  it("normalizes ampersands when matching", () => {
    expect(resolveTopicSlug("OSI and TCP/IP models")).toBe("osi-model");
  });
});

describe("hasTopicVideo", () => {
  it("returns true when resolveTopicSlug finds a match", () => {
    expect(hasTopicVideo("OSPF")).toBe(true);
    expect(hasTopicVideo("DNS")).toBe(true);
  });

  it("returns false when no topic matches", () => {
    expect(hasTopicVideo("quantum networking")).toBe(false);
  });
});

describe("topic catalog helpers", () => {
  it("getTopicBySlug returns the matching entry", () => {
    const topic = getTopicBySlug("vlan");
    expect(topic?.title).toBe("VLANs");
    expect(topic?.youtubeId).toBe("cjFzOnm6u1g");
  });

  it("getAllTopics returns the full catalog", () => {
    expect(getAllTopics()).toEqual(TOPIC_VIDEOS);
    expect(getAllTopics().length).toBeGreaterThan(40);
  });

  it("getRelatedTopics resolves slugs and skips unknown", () => {
    const related = getRelatedTopics(["vlan", "missing-slug", "trunk-8021q"]);
    expect(related.map((t) => t.slug)).toEqual(["vlan", "trunk-8021q"]);
  });

  it("getTopicsForModule filters by module id", () => {
    const ospfTopics = getTopicsForModule("m8-ospf");
    expect(ospfTopics.length).toBeGreaterThan(0);
    expect(ospfTopics.every((t) => t.moduleIds.includes("m8-ospf"))).toBe(true);
  });

  it("getTopicsForPhase filters by phase id", () => {
    const phase2 = getTopicsForPhase("phase-2");
    expect(phase2.length).toBeGreaterThan(0);
    expect(phase2.some((t) => t.slug === "vlan")).toBe(true);
  });
});
