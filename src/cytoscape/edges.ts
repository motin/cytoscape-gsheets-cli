import { Network } from "./networksJs";

export const columns = [
  {
    key: "id",
    name: "Id",
  },
  {
    key: "name",
    name: "Name",
    formula: true,
  },
  {
    key: "sync_status",
    name: "Sync status",
  },
  {
    key: "source",
    name: "Source",
  },
  {
    key: "source_name",
    name: "Source Name",
    formula: true,
  },
  {
    key: "target",
    name: "Target",
  },
  {
    key: "target_name",
    name: "Target Name",
    formula: true,
  },
  {
    key: "shared_name",
    name: "Shared Name",
    formula: true,
  },
  {
    key: "width",
    name: "Width",
    formula: true,
  },
  {
    key: "suid",
    name: "SUID",
    formula: true,
  },
];

export const getEdgeDataKeys = (network: Network) => {
  const dataKeys = [];
  network.elements.edges.map(edge => {
    for (const dataKey of Object.keys(edge.data)) {
      if (!dataKeys.includes(dataKey)) {
        dataKeys.push(dataKey);
      }
    }
  });
  return dataKeys;
};
