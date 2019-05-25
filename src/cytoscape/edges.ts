import { Network } from "./networksJs";

export const columns = [
  {
    key: "id",
    name: "Id",
  },
  {
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
    key: "target",
    name: "Target",
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
