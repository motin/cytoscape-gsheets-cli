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
    key: "type",
    name: "Type",
  },
  {
    key: "sync_status",
    name: "Sync status",
  },
  {
    formula: true,
    key: "shared_name",
    name: "Shared Name",
  },
  {
    formula: true,
    key: "size",
    name: "Size",
  },
  {
    formula: true,
    key: "label_font_size",
    name: "Label font size",
  },
  {
    formula: true,
    key: "suid",
    name: "SUID",
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
