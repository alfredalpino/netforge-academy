/**
 * Full-course YouTube playlists (in-app player + episode list).
 * Distinct from TOPIC_VIDEOS (single-concept JITL lectures).
 */

export interface PlaylistVideo {
  index: number;
  title: string;
  videoId: string;
}

export interface CoursePlaylist {
  slug: string;
  title: string;
  summary: string;
  playlistId: string;
  channel: string;
  channelUrl: string;
  phaseIds: string[];
  moduleIds: string[];
  tags: string[];
  videos: PlaylistVideo[];
}

export const COURSE_PLAYLISTS: CoursePlaylist[] = [
  {
    "slug": "ccna-bombal",
    "title": "Free CCNA 200-301 Practical Course",
    "summary": "David Bombal Tech — practical CCNA with Packet Tracer, real gear, subnetting quizzes, NAT, and port security.",
    "playlistId": "PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds",
    "channel": "David Bombal Tech",
    "channelUrl": "https://www.youtube.com/@DavidBombalTech",
    "phaseIds": [
      "phase-1",
      "phase-2"
    ],
    "moduleIds": [
      "m1-architecture",
      "m2-ethernet",
      "m3-subnetting"
    ],
    "tags": [
      "CCNA",
      "practical",
      "Packet Tracer"
    ],
    "videos": [
      {
        "index": 1,
        "title": "FREE CCNA 200-301 course // Complete Practical CCNA (v1.1 2025 Course) with real equipment",
        "videoId": "tj3yCZWOWYc"
      },
      {
        "index": 2,
        "title": "Network Basics - What is a network? // FREE CCNA 200-301 course",
        "videoId": "XSN9xW4pRac"
      },
      {
        "index": 3,
        "title": "What is a Switch? A Router? What network is this? And what are these? // FREE CCNA 200-301 course",
        "videoId": "qIIRSwnIcaA"
      },
      {
        "index": 4,
        "title": "Cisco Packet Tracer install (Windows 11) // FREE CCNA 200-301 course",
        "videoId": "XXCEk8FO9lQ"
      },
      {
        "index": 5,
        "title": "Cisco Packet Tracer install (Apple macOS) // FREE CCNA 200-301 course",
        "videoId": "rKUhxX_a-mg"
      },
      {
        "index": 6,
        "title": "CCNA Packet Tracer Tips & Tricks (FREE CCNA 200-301 Course 2025)",
        "videoId": "_nrvLja2lfY"
      },
      {
        "index": 7,
        "title": "Real Equipment vs. Packet Tracer (FREE CCNA 200-301 Course 2025)",
        "videoId": "RLTiLwQ75YQ"
      },
      {
        "index": 8,
        "title": "Build a network with me for free using Cisco Packet Tracer (FREE CCNA 200-301 Course 2025)",
        "videoId": "jW5GhNhBReA"
      },
      {
        "index": 9,
        "title": "Build a Web Server network for free using Cisco Packet Tracer (FREE CCNA 200-301 Course 2025)",
        "videoId": "EdsLU9oBudg"
      },
      {
        "index": 10,
        "title": "How does a Switch learn MAC addresses? What is a MAC address table? (FREE CCNA 200-301 Course 2025)",
        "videoId": "9DSSyffnMn0"
      },
      {
        "index": 11,
        "title": "Why is ARP used in networks? (FREE CCNA 200-301 Course 2025)",
        "videoId": "xjV5akqB9lk"
      },
      {
        "index": 12,
        "title": "TCP/IP Model vs OSI Model (FREE CCNA 200-301 Course 2025)",
        "videoId": "a0UIbw1MsUM"
      },
      {
        "index": 13,
        "title": "TCP/IP Model: Where are the devices and protocols?",
        "videoId": "0vgUkk-WzcU"
      },
      {
        "index": 14,
        "title": "TCP/IP Model: PDUs and Encapsulation & Decapsulation",
        "videoId": "xeAe7kyejiI"
      },
      {
        "index": 15,
        "title": "TCP/IP Model: Packet Tracer Lab (hands on lab)",
        "videoId": "vlIYXh50tP4"
      },
      {
        "index": 16,
        "title": "Real Device Wireshark Lab (TCP/IP Model)",
        "videoId": "IIbVsQZ0O9M"
      },
      {
        "index": 17,
        "title": "Free CCNA Course: Practical Subnetting Quiz 1 (with real devices): Can you work this out?",
        "videoId": "A8ZHyLDIHWs"
      },
      {
        "index": 18,
        "title": "Free CCNA Course: Practical Subnetting Quiz 2 (with real devices): Can you work this out?",
        "videoId": "_E52osoelRw"
      },
      {
        "index": 19,
        "title": "Build Real Networks: Cisco, Starlink & DHCP Lab Setup",
        "videoId": "fYUlaR5hLS8"
      },
      {
        "index": 20,
        "title": "CCNA Course Split Explanation // FREE CCNA 200-301 course",
        "videoId": "yYdw4GpG5hg"
      },
      {
        "index": 21,
        "title": "Networking Myths: ARP and Switch MAC Address Tables",
        "videoId": "I3ET3uD_Sq8"
      },
      {
        "index": 22,
        "title": "What happens when there is no DHCP server?",
        "videoId": "uXgHDW7erZE"
      },
      {
        "index": 23,
        "title": "STOP Unauthorized Plugs: 3 Violation Modes EXPLAINED",
        "videoId": "M0D826zVUgQ"
      },
      {
        "index": 24,
        "title": "The ULTIMATE Guide to Cisco Port Security - Part 2",
        "videoId": "woJnkIgfTHk"
      },
      {
        "index": 25,
        "title": "Port Security in Practice: Modes, Logs, Counters, and Auto Recovery",
        "videoId": "o94DO057oY8"
      },
      {
        "index": 26,
        "title": "Hack DHCP with Python and Kali Linux! This is why you need DHCP Snooping // FREE CCNA 200-301 Course",
        "videoId": "OMG4FkmOUsg"
      },
      {
        "index": 27,
        "title": "Hacking networks with Python (FREE CCNA 200-301 Course 2025)",
        "videoId": "cPqWnDrSi0Q"
      },
      {
        "index": 28,
        "title": "Root Guard Lab (FREE CCNA 200-301 Course 2025)",
        "videoId": "nDwIP7H7shk"
      },
      {
        "index": 29,
        "title": "Destroy a network with one command! (FREE CCNA 200-301 Course 2025)",
        "videoId": "IapKbClK-wI"
      },
      {
        "index": 30,
        "title": "null",
        "videoId": "DBdR-QzwOqI"
      },
      {
        "index": 31,
        "title": "NAT saved IPv4, the 3 RFC1918 ranges explained simply",
        "videoId": "s1NLnxEULfw"
      },
      {
        "index": 32,
        "title": "This is what you use at home: NAT Overload (PAT) Demonstration",
        "videoId": "SgpfiDFQJGY"
      },
      {
        "index": 33,
        "title": "Free CCNA Course: Configure Static NAT",
        "videoId": "CkHL1NYRs3Y"
      },
      {
        "index": 34,
        "title": "Free CCNA Course: Dynamic NAT Pool (Live Lab)",
        "videoId": "nkqg_5GAQo4"
      },
      {
        "index": 35,
        "title": "Terraform for CCNA and beyond (demos included)",
        "videoId": "0TGRbJa6QC8"
      },
      {
        "index": 36,
        "title": "You have to learn this! AI for the CCNA 2025 exam! // FREE CCNA 200-301 course",
        "videoId": "KBMe0pSAFYU"
      },
      {
        "index": 37,
        "title": "What is My IP Address? Windows Linux Mac Network Commands Guide",
        "videoId": "8B7cYqAzMDw"
      }
    ]
  },
  {
    "slug": "security-plus",
    "title": "CompTIA Security+ SY0-701",
    "summary": "Professor Messer’s complete SY0-701 course — threats, crypto, IAM, network security, and exam prep.",
    "playlistId": "PLG49S3nxzAnl4QDVqK-hOnoqcSKEIDDuv",
    "channel": "Professor Messer",
    "channelUrl": "https://www.youtube.com/@professormesser",
    "phaseIds": [
      "phase-5"
    ],
    "moduleIds": [
      "m13-security-fundamentals",
      "m14-network-security"
    ],
    "tags": [
      "Security+",
      "SY0-701",
      "cert-prep"
    ],
    "videos": [
      {
        "index": 1,
        "title": "How to Pass Your SY0-701 Security+ Exam in 2026",
        "videoId": "KiEptGbnEBc"
      },
      {
        "index": 2,
        "title": "Security Controls - CompTIA Security+ SY0-701 - 1.1",
        "videoId": "STM3EUvL7wg"
      },
      {
        "index": 3,
        "title": "The CIA Triad - CompTIA Security+ SY0-701 - 1.2",
        "videoId": "SBcDGb9l6yo"
      },
      {
        "index": 4,
        "title": "Non-repudiation - CompTIA Security+ SY0-701 - 1.2",
        "videoId": "XxnCxPEllMg"
      },
      {
        "index": 5,
        "title": "Authentication, Authorization, and Accounting - CompTIA Security+ SY0-701 - 1.2",
        "videoId": "AhaZtj5P2a8"
      },
      {
        "index": 6,
        "title": "Gap Analysis - CompTIA Security+ SY0-701 - 1.2",
        "videoId": "cuTVyyS5C7M"
      },
      {
        "index": 7,
        "title": "Zero Trust - CompTIA Security+ SY0-701 - 1.2",
        "videoId": "zC_Pndpg8-c"
      },
      {
        "index": 8,
        "title": "Physical Security - CompTIA SY0-701 Security+ - 1.2",
        "videoId": "YtT8q2mUM9c"
      },
      {
        "index": 9,
        "title": "Deception and Disruption - CompTIA Security+SY0-701 - 1.2",
        "videoId": "X_qfMVty4ts"
      },
      {
        "index": 10,
        "title": "Change Management - CompTIA Security+ SY0-701 - 1.3",
        "videoId": "48wRbMdHFVI"
      },
      {
        "index": 11,
        "title": "Technical Change Management - CompTIA Security+ SY0-701 - 1.3",
        "videoId": "H9TYNjcpl-0"
      },
      {
        "index": 12,
        "title": "Public Key Infrastructure - CompTIA Security+ Sy0-701 - 1.4",
        "videoId": "xHAMEF7-inQ"
      },
      {
        "index": 13,
        "title": "Encrypting Data - CompTIA Security+ SY0-701 - 1.4",
        "videoId": "jpsc4c7lntw"
      },
      {
        "index": 14,
        "title": "Key Exchange - CompTIA Security+ SY0-701 - 1.4",
        "videoId": "U6BWn81P5Ec"
      },
      {
        "index": 15,
        "title": "Encryption Technologies - CompTIA Security+ SY0-701 - 1.4",
        "videoId": "u61J0xR_XPU"
      },
      {
        "index": 16,
        "title": "Obfuscation - CompTIA Security+ SY0-701 - 1.4",
        "videoId": "LfuTMzZke4g"
      },
      {
        "index": 17,
        "title": "Hashing and Digital Signatures - CompTIA Security+ SY0-701 - 1.4",
        "videoId": "EcGmQjl6XEo"
      },
      {
        "index": 18,
        "title": "Blockchain Technology - CompTIA Security+ SY0-701 - 1.4",
        "videoId": "-wqU_2ToP1M"
      },
      {
        "index": 19,
        "title": "Certificates - CompTIA Security+ SY0-701 - 1.4",
        "videoId": "cLa94BZH_9s"
      },
      {
        "index": 20,
        "title": "Threat Actors - CompTIA Security+ SY0-701 - 2.1",
        "videoId": "6xUH0t6ugIM"
      },
      {
        "index": 21,
        "title": "Common Threat Vectors - CompTIA Security+ SY0-701 - 2.2",
        "videoId": "4lAbGpTDZ18"
      },
      {
        "index": 22,
        "title": "Phishing - CompTIA Security+ SY0-701 - 2.2",
        "videoId": "9SD6DRCKZFU"
      },
      {
        "index": 23,
        "title": "Impersonation - CompTIA Security+ SY0-701 - 2.2",
        "videoId": "X3yoNAVuKwA"
      },
      {
        "index": 24,
        "title": "Watering Hole Attacks - CompTIA Security+ SY0-701 - 2.2",
        "videoId": "z413PV6l_Ys"
      },
      {
        "index": 25,
        "title": "Other Social Engineering Attacks - CompTIA Security+ SY0-701 - 2.2",
        "videoId": "akoDmeV3LQo"
      },
      {
        "index": 26,
        "title": "Memory Injections - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "kBcTczu8FsM"
      },
      {
        "index": 27,
        "title": "Buffer Overflows - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "0-qeeI5jTqU"
      },
      {
        "index": 28,
        "title": "Race Conditions - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "MKptc1lPSw8"
      },
      {
        "index": 29,
        "title": "Malicious Updates - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "KbtUrdBy9Yo"
      },
      {
        "index": 30,
        "title": "Operating System Vulnerabilities - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "narir8qpGq8"
      },
      {
        "index": 31,
        "title": "SQL Injection - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "qFUOLkEk8AQ"
      },
      {
        "index": 32,
        "title": "Cross-site Scripting - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "PKgw0CLZIhE"
      },
      {
        "index": 33,
        "title": "Hardware Vulnerabilities - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "TaTaEvqjjDM"
      },
      {
        "index": 34,
        "title": "Virtualization Vulnerabilities - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "t2JrPrzRDLA"
      },
      {
        "index": 35,
        "title": "Cloud-specific Vulnerabilities - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "V2DCYO-sWRQ"
      },
      {
        "index": 36,
        "title": "Supply Chain Vulnerabilities - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "WqvCJLpwExY"
      },
      {
        "index": 37,
        "title": "Misconfiguration Vulnerabilities - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "NBKzlUqzVmE"
      },
      {
        "index": 38,
        "title": "Mobile Device Vulnerabilities - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "DRfAwwdzYpU"
      },
      {
        "index": 39,
        "title": "Zero-day Vulnerabilities - CompTIA Security+ SY0-701 - 2.3",
        "videoId": "FDFxGLnZtoY"
      },
      {
        "index": 40,
        "title": "An Overview of Malware - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "-eZs8wjjGGE"
      },
      {
        "index": 41,
        "title": "Viruses and Worms - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "Su8ANmAoerU"
      },
      {
        "index": 42,
        "title": "Spyware and Bloatware - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "-VmI3xFJw78"
      },
      {
        "index": 43,
        "title": "Other Malware Types - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "nu27ovJ5rqw"
      },
      {
        "index": 44,
        "title": "Physical Attacks - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "oIpOuTX2HRs"
      },
      {
        "index": 45,
        "title": "Denial of Service - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "Z7OntvK--PQ"
      },
      {
        "index": 46,
        "title": "DNS Attacks - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "BoxeL5ybOXI"
      },
      {
        "index": 47,
        "title": "Wireless Attacks - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "tSLqrKhUvts"
      },
      {
        "index": 48,
        "title": "On-path Attacks - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "M_Af6_8JTuo"
      },
      {
        "index": 49,
        "title": "Replay Attacks - CompTIA Security+ SY0-701- 2.4",
        "videoId": "ai6qS13gKRo"
      },
      {
        "index": 50,
        "title": "Malicious Code - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "xDhUBQ_lnUA"
      },
      {
        "index": 51,
        "title": "Application Attacks - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "yRSqIGjeb7s"
      },
      {
        "index": 52,
        "title": "Cryptographic Attacks - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "7aJaEQy6Yoc"
      },
      {
        "index": 53,
        "title": "Password Attacks - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "-ZfbifHwEVE"
      },
      {
        "index": 54,
        "title": "Indicators of Compromise - CompTIA Security+ SY0-701 - 2.4",
        "videoId": "x72hG9GvkaQ"
      },
      {
        "index": 55,
        "title": "Segmentation and Access Control - CompTIA Security+ SY0-701 - 2.5",
        "videoId": "yDeDGCh_PDs"
      },
      {
        "index": 56,
        "title": "Mitigation Techniques - CompTIA Security+ SY0-701 - 2.5",
        "videoId": "Fc8ZJfmapbI"
      },
      {
        "index": 57,
        "title": "Hardening Techniques - CompTIA Security+ SY0-701 - 2.5",
        "videoId": "wXoC46Qr_9Q"
      },
      {
        "index": 58,
        "title": "Cloud Infrastructures - CompTIA Security+ SY0-701 - 3.1",
        "videoId": "8qpQ8Q6xxiU"
      },
      {
        "index": 59,
        "title": "Network Infrastructure Concepts - CompTIA Security+ SY0-701 - 3.1",
        "videoId": "jd001Hj7XWM"
      },
      {
        "index": 60,
        "title": "Other Infrastructure Concepts - CompTIA Security+ SY0-701 - 3.1",
        "videoId": "HDiNPPrGhzE"
      },
      {
        "index": 61,
        "title": "Infrastructure Considerations - CompTIA Security+ SY0-701 - 3.1",
        "videoId": "Ap3Z_0ZdqpQ"
      },
      {
        "index": 62,
        "title": "Secure Infrastructures - CompTIA Security+ SY0-701 - 3.2",
        "videoId": "l64La1xYXL4"
      },
      {
        "index": 63,
        "title": "Intrusion Prevention - CompTIA Security+ SY0-701 - 3.2",
        "videoId": "7QuYupuic3Q"
      },
      {
        "index": 64,
        "title": "Network Appliances - CompTIA Security+ SY0-701 - 3.2",
        "videoId": "WlOslEy3ztg"
      },
      {
        "index": 65,
        "title": "Port Security - CompTIA Security+ SY0-701 - 3.2",
        "videoId": "QhLQ6J4satw"
      },
      {
        "index": 66,
        "title": "Firewall Types - CompTIA Security+ SY0-701 - 3.2",
        "videoId": "mq1HRM-zGtQ"
      },
      {
        "index": 67,
        "title": "Secure Communication - CompTIA Security+ SY0-701 - 3.2",
        "videoId": "uU3e_ntg-3g"
      },
      {
        "index": 68,
        "title": "Data Types and Classifications - CompTIA Security+ SY0-701 - 3.3",
        "videoId": "R0W0_gZCVzk"
      },
      {
        "index": 69,
        "title": "States of Data - CompTIA Security+ SY0-701 - 3.3",
        "videoId": "71RQaYQ4QSw"
      },
      {
        "index": 70,
        "title": "Protecting Data - CompTIA Security+ SY0-701 - 3.3",
        "videoId": "leX_Qa7wqB4"
      },
      {
        "index": 71,
        "title": "Resiliency - CompTIA Security+ SY0-701 - 3.4",
        "videoId": "sb0dRaQbuBA"
      },
      {
        "index": 72,
        "title": "Capacity Planning - CompTIA Security+ SY0-701 - 3.4",
        "videoId": "WGlT6-gNwqY"
      },
      {
        "index": 73,
        "title": "Recovery Testing - CompTIA Security+ SY0-701 - 3.4",
        "videoId": "IhT7Odu4xHc"
      },
      {
        "index": 74,
        "title": "Backups - CompTIA Security+ SY0-701 - 3.4",
        "videoId": "8mGSwRScqIM"
      },
      {
        "index": 75,
        "title": "Power Resiliency - CompTIA Security+ SY0-701 - 3.4",
        "videoId": "-EY45MimSBM"
      },
      {
        "index": 76,
        "title": "Secure Baselines - CompTIA Security+ SY0-701 - 4.1",
        "videoId": "BWPJD9Eb9iE"
      },
      {
        "index": 77,
        "title": "Hardening Targets - CompTIA Security+ SY0-701 - 4.1",
        "videoId": "YQKbs0ug0XQ"
      },
      {
        "index": 78,
        "title": "Securing Wireless and Mobile - CompTIA Security+ SY0-701 - 4.1",
        "videoId": "iAR6SgvtezY"
      },
      {
        "index": 79,
        "title": "Wireless Security Settings - CompTIA Security+ SY0-701 - 4.1",
        "videoId": "KaqKoKNEKnE"
      },
      {
        "index": 80,
        "title": "Application Security - CompTIA Security+ SY0-701 - 4.1",
        "videoId": "fFvXy3WkLpA"
      },
      {
        "index": 81,
        "title": "Asset Management - CompTIA Security+ SY0-701 - 4.2",
        "videoId": "BJ2UMB4a04g"
      },
      {
        "index": 82,
        "title": "Vulnerability Scanning - CompTIA Security+ SY0-701 - 4.3",
        "videoId": "9B0mtWk_AM0"
      },
      {
        "index": 83,
        "title": "Threat Intelligence - CompTIA Security+ SY0-701 - 4.3",
        "videoId": "86fruE9jkKk"
      },
      {
        "index": 84,
        "title": "Penetration Testing - CompTIA Security+ SY0-701 - 4.3",
        "videoId": "-LevHAzXgFs"
      },
      {
        "index": 85,
        "title": "Analyzing Vulnerabilities - CompTIA Security+ SY0-701 - 4.3",
        "videoId": "eyVy1gKCuAU"
      },
      {
        "index": 86,
        "title": "Vulnerability Remediation - CompTIA Security+ SY0-701 - 4.3",
        "videoId": "P9xakfmX70c"
      },
      {
        "index": 87,
        "title": "Security Monitoring - CompTIA Security+ SY0-701 - 4.4",
        "videoId": "np2WI_rM-Ok"
      },
      {
        "index": 88,
        "title": "Security Tools - CompTIA Security+ SY0-701 - 4.4",
        "videoId": "nNiNTviiacU"
      },
      {
        "index": 89,
        "title": "Firewalls - CompTIA Security+ SY0-701 - 4.5",
        "videoId": "VgNyh4HEqSU"
      },
      {
        "index": 90,
        "title": "Web Filtering - CompTIA Security+ SY0-701 - 4.5",
        "videoId": "I_c0D49uCwQ"
      },
      {
        "index": 91,
        "title": "Operating System Security - CompTIA Security+ SY0-701 - 4.5",
        "videoId": "4dpTyRM6BU8"
      },
      {
        "index": 92,
        "title": "Secure Protocols - CompTIA Security+ SY0-701 - 4.5",
        "videoId": "9NAKCyOtFH0"
      },
      {
        "index": 93,
        "title": "Email Security - CompTIA Security+ SY0-701 - 4.5",
        "videoId": "v6ht9efsnRI"
      },
      {
        "index": 94,
        "title": "Monitoring Data - CompTIA Security+ SY0-701 - 4.5",
        "videoId": "ZDJ-BLPLWq4"
      },
      {
        "index": 95,
        "title": "Endpoint Security - CompTIA Security+ SY0-701 - 4.5",
        "videoId": "83pCkSSj1IQ"
      },
      {
        "index": 96,
        "title": "Identity and Access Management - CompTIA Security+ SY0-701 - 4.6",
        "videoId": "ZoOyyqhptik"
      },
      {
        "index": 97,
        "title": "Access Controls - CompTIA Security+ SY0-701 - 4.6",
        "videoId": "9ANHcZwJfdQ"
      },
      {
        "index": 98,
        "title": "Multifactor Authentication - CompTIA Security+ SY0-701 - 4.6",
        "videoId": "MpIzA4fNWew"
      },
      {
        "index": 99,
        "title": "Password Security - CompTIA Security+ SY0-701 - 4.6",
        "videoId": "eMOe-PLBy1k"
      },
      {
        "index": 100,
        "title": "Scripting and Automation - CompTIA Security+ SY0-701 - 4.7",
        "videoId": "R9ojg881dLs"
      },
      {
        "index": 101,
        "title": "Incident Response - CompTIA Security+ SY0-701 - 4.8",
        "videoId": "X2UiMLxRdhE"
      },
      {
        "index": 102,
        "title": "Incident Planning - CompTIA Security+ SY0-701 - 4.8",
        "videoId": "CYFe16lCRMk"
      },
      {
        "index": 103,
        "title": "Digital Forensics - CompTIA Security+ SY0-701 - 4.8",
        "videoId": "UtDWApdO8Zk"
      },
      {
        "index": 104,
        "title": "Log Data - CompTIA Security+ SY0-701 - 4.9",
        "videoId": "EDru1LTYDJw"
      },
      {
        "index": 105,
        "title": "Security Policies - CompTIA Security+ SY0-701 - 5.1",
        "videoId": "5kY9kvzeWjA"
      },
      {
        "index": 106,
        "title": "Security Standards - CompTIA Security+ SY0-701 - 5.1",
        "videoId": "jBvdRpXaomk"
      },
      {
        "index": 107,
        "title": "Security Procedures - CompTIA Security+ SY0-701 - 5.1",
        "videoId": "vJINnOZyQNg"
      },
      {
        "index": 108,
        "title": "Security Considerations - CompTIA Security+ SY0-701 - 5.1",
        "videoId": "4tGFraaP48Q"
      },
      {
        "index": 109,
        "title": "Data Roles and Responsibilities - CompTIA Security+ SY0-701 - 5.1",
        "videoId": "gxNi-04yP8Q"
      },
      {
        "index": 110,
        "title": "Risk Management - CompTIA Security+ SY0-701 - 5.2",
        "videoId": "cLhUMoQS1a8"
      },
      {
        "index": 111,
        "title": "Risk Analysis - CompTIA Security+ SY0-701 - 5.2",
        "videoId": "Ykx7t54y-oo"
      },
      {
        "index": 112,
        "title": "Risk Management Strategies - CompTIA Security+ SY0-701 - 5.2",
        "videoId": "pmyuWY7Pbag"
      },
      {
        "index": 113,
        "title": "Business Impact Analysis - CompTIA Security+ SY0-701 - 5.2",
        "videoId": "myI-v3mj7Kc"
      },
      {
        "index": 114,
        "title": "Third-party Risk Assessment - CompTIA Security+ SY0-701 - 5.3",
        "videoId": "13KNjPexnEI"
      },
      {
        "index": 115,
        "title": "Agreement Types - CompTIA Security+ SY0-701 - 5.3",
        "videoId": "HSZxjj1YAh8"
      },
      {
        "index": 116,
        "title": "Compliance - CompTIA Security+ SY0-701 - 5.4",
        "videoId": "IjJf4jLtONQ"
      },
      {
        "index": 117,
        "title": "Privacy - CompTIA Security+ SY0-701 - 5.4",
        "videoId": "WGXrbAh0LUI"
      },
      {
        "index": 118,
        "title": "Audits and Assessments - CompTIA Security+ SY0-701 - 5.5",
        "videoId": "uo2Yw720mv4"
      },
      {
        "index": 119,
        "title": "Penetration Tests - CompTIA Security+ SY0-701 - 5.5",
        "videoId": "wEMzVfwBiWY"
      },
      {
        "index": 120,
        "title": "Security Awareness - CompTIA Security+ SY0-701 - 5.6",
        "videoId": "W_Npxwk4fbI"
      },
      {
        "index": 121,
        "title": "User Training - CompTIA Security+ SY0-701 - 5.6",
        "videoId": "WQRZMMLUkGE"
      }
    ]
  },
  {
    "slug": "bash-scripting",
    "title": "The Complete Bash Scripting Course",
    "summary": "Dave Eddy (ysap.sh) — from the terminal through scripting, pipes, globbing, and real Bash pitfalls.",
    "playlistId": "PL-my9REMIFtGgiQAXqKPJ5UrLdSkxcLBT",
    "channel": "You Suck at Programming",
    "channelUrl": "https://www.youtube.com/@yousuckatprogramming",
    "phaseIds": [
      "phase-0"
    ],
    "moduleIds": [
      "m0-foundation"
    ],
    "tags": [
      "Linux",
      "Bash",
      "CLI"
    ],
    "videos": [
      {
        "index": 1,
        "title": "The Complete Bash Scripting Course (pt1)",
        "videoId": "uAmIIWYMgS4"
      },
      {
        "index": 2,
        "title": "Terminal and Finder (files on the terminal) - Bash Scripting Course (pt2)",
        "videoId": "Tl5LL5TjnZI"
      },
      {
        "index": 3,
        "title": "Basic File Manipulation on the Terminal - Bash Scripting Course (pt3)",
        "videoId": "tKlRZbhXP4E"
      },
      {
        "index": 4,
        "title": "Hidden Files on the terminal - Bash Scripting Course (pt4)",
        "videoId": "EAZqEAjXRp8"
      },
      {
        "index": 5,
        "title": "Searching in Files using `grep` - Bash Scripting Course (pt5)",
        "videoId": "XJGnwwlZVxg"
      },
      {
        "index": 6,
        "title": "Paging Files using `less` and `more` - Bash Scripting Course (pt6)",
        "videoId": "jFtjE_Dix1U"
      },
      {
        "index": 7,
        "title": "Man Pages and finding command documentation - Bash Scripting Course (pt7)",
        "videoId": "OqR3zk_EBgk"
      },
      {
        "index": 8,
        "title": "Programs and Commands - Bash Scripting Course (pt8)",
        "videoId": "k_iatXFu0dQ"
      },
      {
        "index": 9,
        "title": "Basic Variables (setting, modifying, storing command output) - Bash Scripting Course (pt9)",
        "videoId": "p2Vf6bgl-io"
      },
      {
        "index": 10,
        "title": "`vim` Crash Course (how to exit vim?!) - Bash Scripting Course (pt10)",
        "videoId": "xLB48cLX8V8"
      },
      {
        "index": 11,
        "title": "File Permissions (unix `chmod` and `chown` commands) - Bash Scripting Course (pt11)",
        "videoId": "7VL7PVaYI74"
      },
      {
        "index": 12,
        "title": "Finally Scripting (your first Bash Script) - Bash Scripting Course (pt12)",
        "videoId": "8QjYvdJbI7M"
      },
      {
        "index": 13,
        "title": "User Input (taking user input in a script) - Bash Scripting Course (pt13)",
        "videoId": "dpQh0iBILI4"
      },
      {
        "index": 14,
        "title": "Functions in Bash - Bash Scripting Course (pt14)",
        "videoId": "1yE-TKQpl_Y"
      },
      {
        "index": 15,
        "title": "Conditionals / if statements with [ ... ] and [[ ... ]] - Bash Scripting Course (pt15)",
        "videoId": "j_3HSMFzLcI"
      },
      {
        "index": 16,
        "title": "Bash has multiple `for` loops? - Bash Scripting Course (pt16)",
        "videoId": "gSTYxPSvw34"
      },
      {
        "index": 17,
        "title": "Input / Output (stdin & stdout) - Bash Scripting Course (pt17)",
        "videoId": "ITXVrYO0jVo"
      },
      {
        "index": 18,
        "title": "Bash Scripting Course - Chapter 3 Recap (pt18)",
        "videoId": "oRQUElsppjs"
      },
      {
        "index": 19,
        "title": "Case Statements in Bash - Bash Scripting Course (pt19)",
        "videoId": "Pj-hpJhWz_k"
      },
      {
        "index": 20,
        "title": "Indexed Arrays in Bash - Bash Scripting Course (pt20)",
        "videoId": "PQ0umTqpQtQ"
      },
      {
        "index": 21,
        "title": "Associative Arrays in Bash - Bash Scripting Course (pt21)",
        "videoId": "CUBDuDmzFCw"
      },
      {
        "index": 22,
        "title": "IFS Variable (Internal Field Separator) - Bash Scripting Course (pt22)",
        "videoId": "lPzCLi4rSaI"
      },
      {
        "index": 23,
        "title": "Command Substitution (storing commands in variables in bash) - Bash Scripting Course (pt23)",
        "videoId": "GZoTLuIL2aw"
      },
      {
        "index": 24,
        "title": "Arithmetic Expression (Math Syntax) in Bash - Bash Scripting Course (pt24)",
        "videoId": "EqFs43rkXg8"
      },
      {
        "index": 25,
        "title": "Process Substitution - Bash Scripting Course (pt25)",
        "videoId": "7MWqli8TguY"
      },
      {
        "index": 26,
        "title": "Bash Scripting Course - Chapter 4 Recap (pt26)",
        "videoId": "XVekvNbhMOo"
      },
      {
        "index": 27,
        "title": "`cut` and `tr` Unix Commands - Bash Scripting Course (pt27)",
        "videoId": "tdMXMFFdz0o"
      },
      {
        "index": 28,
        "title": "sed, awk, and grep Unix Commands - Bash Scripting Course (pt28)",
        "videoId": "dv4kmOydWyI"
      },
      {
        "index": 29,
        "title": "`find` Command (finding files on unix) - Bash Scripting Course (pt29)",
        "videoId": "qFBLRL402UY"
      },
      {
        "index": 30,
        "title": "Bash Arguments (set -u, set -x, bash -n, etc.) - Bash Scripting Course (pt30)",
        "videoId": "B3tZ-efxjPo"
      },
      {
        "index": 31,
        "title": "Pipe Status ($PIPESTATUS array) - Inspect a pipeline in bash - Bash Scripting Course (pt31)",
        "videoId": "UAs_aRsrs4E"
      },
      {
        "index": 32,
        "title": "Timing Commands (bash `time` command) - Bash Scripting Course (pt32)",
        "videoId": "0Ui_qCjQm04"
      },
      {
        "index": 33,
        "title": "Sourcing Code (libraries with bash) - Bash Scripting Course (pt33)",
        "videoId": "XGslD8bD6dQ"
      },
      {
        "index": 34,
        "title": "Curlies {...} vs. Parens (...) (local variables in bash) - Bash Scripting Course (pt34)",
        "videoId": "Vm9ohF9V0js"
      },
      {
        "index": 35,
        "title": "Return vs. Output (bash exit codes) - Bash Scripting Course (pt35)",
        "videoId": "atUqZlXKL2E"
      },
      {
        "index": 36,
        "title": "Bash Scripting Course - Chapter 7 Recap (pt36)",
        "videoId": "XtnbWx7nksM"
      },
      {
        "index": 37,
        "title": "Parameter Expansion Deep Dive in Bash! - Bash Scripting Course (pt37)",
        "videoId": "V_rKWUr5mXk"
      },
      {
        "index": 38,
        "title": "Array Expansion in Bash - Bash Scripting Course (pt38)",
        "videoId": "n5alrCBIms4"
      },
      {
        "index": 39,
        "title": "Basic Globbing (Wildcard Patterns in Bash) - Bash Scripting Course (pt39)",
        "videoId": "MtmLHiRKk4k"
      },
      {
        "index": 40,
        "title": "Extended Globbing (extglob) - Bash Scripting Course (pt40)",
        "videoId": "rhT-t3rULHE"
      },
      {
        "index": 41,
        "title": "Glob Shell Options (recursively find files in bash!) - Bash Scripting Course (pt41)",
        "videoId": "LnQ4XYkufGU"
      },
      {
        "index": 42,
        "title": "Brace Expansion Bash Scripting Course (pt42)",
        "videoId": "0rIfZAFV2bM"
      },
      {
        "index": 43,
        "title": "Braces and Globbing - Bash Scripting Course (pt43)",
        "videoId": "9FdIHPEeJtA"
      },
      {
        "index": 44,
        "title": "Bash Scripting Course - Numeric Brace Expansion (pt44)",
        "videoId": "zP9X6JZQVlw"
      },
      {
        "index": 45,
        "title": "Understanding `printf()` in Bash - Bash Scripting Course (pt45)",
        "videoId": "u2QjKHaETlw"
      },
      {
        "index": 46,
        "title": "Date Formatting with pure bash (strftime) - Bash Scripting Course (pt46)",
        "videoId": "wAeGKGJUjds"
      },
      {
        "index": 47,
        "title": "Regular Expressions (regex) in pure Bash (no grep!) - Bash Scripting Course (pt47)",
        "videoId": "kkzB3vat31U"
      },
      {
        "index": 48,
        "title": "Reading files in Bash with `mapfile` - Bash Scripting Course (pt48)",
        "videoId": "BA9a8Jh2H_E"
      },
      {
        "index": 49,
        "title": "`test` vs. `[` vs. `[[` in Bash - Bash Scripting Course (pt49)",
        "videoId": "eRmJiekFurU"
      },
      {
        "index": 50,
        "title": "Special Strings with $'...' in Bash - Bash Scripting Course (pt50)",
        "videoId": "mfCcMz3eaqM"
      },
      {
        "index": 51,
        "title": "Responding to unix signals with `trap` - Bash Scripting Course (pt51)",
        "videoId": "BLLpQHCq9pk"
      },
      {
        "index": 52,
        "title": "Named Pipes with `mkfifo` - Bash Scripting Course (pt52)",
        "videoId": "3wDHmmKZEac"
      },
      {
        "index": 53,
        "title": "Color Output on the terminal with ANSI codes - Bash Scripting Course (pt53)",
        "videoId": "Vmp1G64ZkVc"
      },
      {
        "index": 54,
        "title": "Cursor Commands & drawing on the terminal with ANSI - Bash Scripting Course (pt54)",
        "videoId": "ouZjEIUCBHc"
      },
      {
        "index": 55,
        "title": "Is a TTY (isatty(3)) - Bash Scripting Course (pt55)",
        "videoId": "BjVQ3meY33U"
      },
      {
        "index": 56,
        "title": "PS1 Variable (customizing your linux terminal prompt) - Bash Scripting Course (pt56)",
        "videoId": "kLZcgLPrbug"
      },
      {
        "index": 57,
        "title": "Customizing Bash with your .bashrc - Bash Scripting Course (pt57)",
        "videoId": "McSn1c55UO8"
      },
      {
        "index": 58,
        "title": "Readline Shortcuts (terminal keyboard shortcuts) - Bash Scripting Course (pt58)",
        "videoId": "S_nu2cf6Uwc"
      },
      {
        "index": 59,
        "title": "why you shouldn't parse the `ls` command - Bash Scripting Course (pt59)",
        "videoId": "9rSmw9WPQ78"
      },
      {
        "index": 60,
        "title": "Aliases with Arguments in Bash - Bash Scripting Course (pt60)",
        "videoId": "IgkBX9qxzLA"
      },
      {
        "index": 61,
        "title": "Pitfall: Byte vs. String Length - Bash Scripting Course (pt61)",
        "videoId": "ADDlhmPHTfM"
      },
      {
        "index": 62,
        "title": "Shell Forkbomb :(){ :|:&};: - Bash Scripting Course (pt62 - Finale)",
        "videoId": "Ee2T1Aj_8Ws"
      }
    ]
  }
];

export function getAllCoursePlaylists(): CoursePlaylist[] {
  return COURSE_PLAYLISTS;
}

export function getCoursePlaylist(slug: string): CoursePlaylist | undefined {
  return COURSE_PLAYLISTS.find((p) => p.slug === slug);
}

export function getCoursePlaylistsForModule(moduleId: string): CoursePlaylist[] {
  return COURSE_PLAYLISTS.filter((p) => p.moduleIds.includes(moduleId));
}

export function youtubePlaylistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}
