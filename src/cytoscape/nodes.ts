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
];

export const getNodeDataKeys = (network: Network) => {
  const dataKeys = [];
  network.elements.nodes.map(node => {
    for (const dataKey of Object.keys(node.data).concat(
      Object.keys(node.position),
    )) {
      if (!dataKeys.includes(dataKey)) {
        dataKeys.push(dataKey);
      }
    }
  });
  return dataKeys;
};
