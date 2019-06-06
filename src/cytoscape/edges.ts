import { Network } from "./networksJs";

export const columns = [
  {
    key: "id",
    name: "Id",
  },
  {
    formula: true,
    key: "name",
    name: "Name",
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
    formula: true,
    key: "source_name",
    name: "Source Name",
  },
  {
    key: "interaction",
    name: "Interaction",
  },
  {
    key: "target",
    name: "Target",
  },
  {
    formula: true,
    key: "target_name",
    name: "Target Name",
  },
  {
    formula: true,
    key: "shared_name",
    name: "Shared Name",
  },
  {
    formula: true,
    key: "width",
    name: "Width",
  },
  {
    formula: true,
    key: "SUID", // Always exported by cytoscape in capital letters
    name: "SUID",
  },
  {
    formula: true,
    key: "shared_interaction",
    name: "shared_interaction",
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
