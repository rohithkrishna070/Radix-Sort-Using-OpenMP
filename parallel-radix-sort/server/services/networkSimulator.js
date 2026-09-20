const runner = require('./runner');

/**
 * Convert IPv4 dotted string "192.168.1.100" to 32-bit unsigned integer
 */
function ipToInt(ip) {
  if (!ip || typeof ip !== 'string') return 0;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return 0;
  return (
    ((parseInt(parts[0], 10) & 255) * 16777216) +
    ((parseInt(parts[1], 10) & 255) * 65536) +
    ((parseInt(parts[2], 10) & 255) * 256) +
    (parseInt(parts[3], 10) & 255)
  ) >>> 0;
}

/**
 * Convert 32-bit unsigned integer to IPv4 dotted string
 */
function intToIp(intVal) {
  const u = Number(intVal) >>> 0;
  return [
    (u >>> 24) & 255,
    (u >>> 16) & 255,
    (u >>> 8) & 255,
    u & 255
  ].join('.');
}

/**
 * Extract /24 subnet string from an IP (e.g. "192.168.1.0/24")
 */
function getSubnet24(ip) {
  const parts = ip.split('.');
  if (parts.length < 3) return ip;
  return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
}

/**
 * Generate synthetic network packets adhering to real RFC IPv4 patterns
 */
function generatePackets(count, scenario = 'ddos') {
  const packets = [];
  const now = Date.now();

  // Botnet attack subnets for DDoS scenario
  const ddosSubnets = [
    { prefix: [185, 220, 101], name: 'Tor Exit / Mirai Botnet' },
    { prefix: [45, 142, 212], name: 'Rogue Hosting Botnet' },
    { prefix: [194, 26, 29], name: 'Compromised IoT Gateway' }
  ];

  // Department subnets for Enterprise scenario
  const enterpriseSubnets = [
    { prefix: [10, 10, 1], name: 'Finance LAN', port: 443, proto: 'TCP' },
    { prefix: [10, 10, 2], name: 'Engineering LAN', port: 22, proto: 'TCP' },
    { prefix: [10, 10, 3], name: 'Sales & HR LAN', port: 80, proto: 'TCP' },
    { prefix: [192, 168, 1], name: 'Workstation VLAN', port: 443, proto: 'TCP' },
    { prefix: [172, 16, 50], name: 'Internal DB Cluster', port: 5432, proto: 'TCP' }
  ];

  // Common internet ports
  const commonPorts = [80, 443, 53, 22, 8080, 8443];
  const protocols = ['TCP', 'UDP', 'ICMP'];

  for (let i = 0; i < count; i++) {
    let srcIp = '';
    let destIp = '10.0.0.1'; // Target enterprise server
    let protocol = 'TCP';
    let port = 443;
    let packetSize = 64;
    let flags = 'SYN';

    if (scenario === 'ddos') {
      // 75% traffic is from malicious DDoS botnets attacking port 443/80
      const isAttack = Math.random() < 0.75;
      if (isAttack) {
        const subnet = ddosSubnets[Math.floor(Math.random() * ddosSubnets.length)];
        const host = Math.floor(Math.random() * 254) + 1;
        srcIp = `${subnet.prefix[0]}.${subnet.prefix[1]}.${subnet.prefix[2]}.${host}`;
        protocol = Math.random() < 0.6 ? 'TCP' : 'UDP';
        port = Math.random() < 0.8 ? 443 : 80;
        flags = protocol === 'TCP' ? 'SYN-FLOOD' : 'RAW-UDP';
        packetSize = protocol === 'TCP' ? 64 : Math.floor(Math.random() * 512) + 64;
      } else {
        // 25% normal users scattered across internet
        const o1 = Math.floor(Math.random() * 200) + 1;
        const o2 = Math.floor(Math.random() * 255);
        const o3 = Math.floor(Math.random() * 255);
        const o4 = Math.floor(Math.random() * 254) + 1;
        srcIp = `${o1}.${o2}.${o3}.${o4}`;
        protocol = protocols[Math.floor(Math.random() * protocols.length)];
        port = commonPorts[Math.floor(Math.random() * commonPorts.length)];
        flags = 'ACK';
        packetSize = Math.floor(Math.random() * 1200) + 128;
      }
    } else if (scenario === 'enterprise') {
      // Inter-department corporate traffic
      const isInternal = Math.random() < 0.85;
      if (isInternal) {
        const dept = enterpriseSubnets[Math.floor(Math.random() * enterpriseSubnets.length)];
        const host = Math.floor(Math.random() * 254) + 1;
        srcIp = `${dept.prefix[0]}.${dept.prefix[1]}.${dept.prefix[2]}.${host}`;
        destIp = '172.16.0.10'; // Enterprise core gateway
        protocol = dept.proto;
        port = dept.port;
        flags = 'ESTABLISHED';
        packetSize = Math.floor(Math.random() * 1400) + 256;
      } else {
        // External partner traffic
        srcIp = `203.0.113.${Math.floor(Math.random() * 254) + 1}`;
        protocol = 'TCP';
        port = 443;
        flags = 'PSH-ACK';
        packetSize = 1500;
      }
    } else {
      // Global internet backbone traffic
      const o1 = Math.floor(Math.random() * 220) + 1;
      const o2 = Math.floor(Math.random() * 255);
      const o3 = Math.floor(Math.random() * 255);
      const o4 = Math.floor(Math.random() * 254) + 1;
      srcIp = `${o1}.${o2}.${o3}.${o4}`;
      destIp = `${Math.floor(Math.random() * 220) + 1}.${Math.floor(Math.random() * 255)}.1.1`;
      protocol = protocols[Math.floor(Math.random() * protocols.length)];
      port = commonPorts[Math.floor(Math.random() * commonPorts.length)];
      flags = 'DATA';
      packetSize = Math.floor(Math.random() * 1400) + 64;
    }

    packets.push({
      id: i + 1,
      timestamp: now + (i * 2),
      srcIp,
      srcIpInt: ipToInt(srcIp),
      destIp,
      protocol,
      port,
      packetSize,
      flags,
      subnet: getSubnet24(srcIp)
    });
  }

  return packets;
}

/**
 * Aggregate traffic by /24 subnets and identify DDoS anomalies
 */
function analyzeSubnets(packets) {
  const subnetMap = new Map();
  const total = packets.length;

  for (const pkt of packets) {
    const sub = pkt.subnet;
    if (!subnetMap.has(sub)) {
      subnetMap.set(sub, { subnet: sub, count: 0, bytes: 0, sampleIp: pkt.srcIp });
    }
    const record = subnetMap.get(sub);
    record.count++;
    record.bytes += pkt.packetSize;
  }

  const list = Array.from(subnetMap.values()).map(item => {
    const percentage = Number(((item.count / total) * 100).toFixed(1));
    const isThreat = percentage >= 15;
    let threatLevel = 'NORMAL';
    if (percentage >= 30) {
      threatLevel = 'CRITICAL (DDoS Attack)';
    } else if (percentage >= 15) {
      threatLevel = 'SUSPICIOUS (High Rate)';
    }

    return {
      ...item,
      percentage,
      isThreat,
      threatLevel
    };
  });

  // Sort descending by packet volume
  list.sort((a, b) => b.count - a.count);
  return list.slice(0, 12); // Top 12 talker subnets
}

/**
 * Sort packets using OpenMP Radix Sort and compare Static vs Dynamic
 */
function simulateNetworkSort({ count = 10000, scenario = 'ddos', threads = 4, schedule = 'both', customPackets = null }) {
  let packets = [];

  if (Array.isArray(customPackets) && customPackets.length > 0) {
    packets = customPackets.map((p, idx) => {
      const srcIp = typeof p === 'string' ? p.trim() : (p.srcIp || '192.168.1.1');
      return {
        id: idx + 1,
        timestamp: Date.now() + (idx * 2),
        srcIp,
        srcIpInt: ipToInt(srcIp),
        destIp: p.destIp || '10.0.0.1',
        protocol: p.protocol || 'TCP',
        port: p.port || 443,
        packetSize: p.packetSize || 64,
        flags: p.flags || 'SYN',
        subnet: getSubnet24(srcIp)
      };
    });
  } else {
    packets = generatePackets(count, scenario);
  }

  const n = packets.length;
  // Extract 32-bit unsigned integers
  const srcIpInts = packets.map(p => p.srcIpInt);

  // Run through C OpenMP / Serial backend
  const sortResult = runner.runSort(srcIpInts, threads, schedule);

  // Build sorted packets array
  // We can sort the packet objects using the sorted integers or sort by srcIpInt stably
  let sortedPackets = [];
  if (n <= 2000) {
    // For small/medium sets, map objects accurately
    sortedPackets = [...packets].sort((a, b) => (a.srcIpInt > b.srcIpInt ? 1 : a.srcIpInt < b.srcIpInt ? -1 : 0));
  } else {
    // For large benchmarks, sample the top 100
    const sortedSampleInts = (sortResult.parallelSorted || sortResult.serialSorted || []).slice(0, 100);
    sortedPackets = sortedSampleInts.map((intVal, idx) => {
      const ip = intToIp(intVal);
      return {
        id: idx + 1,
        timestamp: Date.now() + (idx * 2),
        srcIp: ip,
        destIp: '10.0.0.1',
        protocol: 'TCP',
        port: 443,
        packetSize: 64,
        flags: 'SORTED',
        subnet: getSubnet24(ip)
      };
    });
  }

  // Analyze subnets
  const subnetStats = analyzeSubnets(packets);

  return {
    inputSize: n,
    scenario,
    threadsUsed: sortResult.threadsUsed || threads,
    serialTime: sortResult.serialTime,
    staticTime: sortResult.staticTime,
    dynamicTime: sortResult.dynamicTime,
    parallelTime: sortResult.parallelTime,
    speedupStatic: sortResult.speedupStatic,
    speedupDynamic: sortResult.speedupDynamic,
    efficiencyStatic: sortResult.efficiencyStatic,
    efficiencyDynamic: sortResult.efficiencyDynamic,
    comparison: sortResult.comparison,
    sampleUnsorted: packets.slice(0, 100),
    sampleSorted: sortedPackets.slice(0, 100),
    allPackets: n <= 200 ? packets : null,
    allSortedPackets: n <= 200 ? sortedPackets : null,
    subnetStats
  };
}

module.exports = {
  ipToInt,
  intToIp,
  getSubnet24,
  generatePackets,
  analyzeSubnets,
  simulateNetworkSort
};
