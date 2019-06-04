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
  {
    key: "leaf_name",
    name: "Leaf Name",
  },
  {
    formula: true,
    key: "tree_level",
    name: "Tree level",
  },
  {
    formula: true,
    key: "parent_id",
    name: "Parent ID",
  },
  {
    key: "tree_level_1_id",
    name: "Tree level 1 ID",
  },
  {
    formula: true,
    key: "tree_level_1_name",
    name: "Tree level 1 Name",
  },
  {
    key: "tree_level_2_id",
    name: "Tree level 2 ID",
  },
  {
    formula: true,
    key: "tree_level_2_name",
    name: "Tree level 2 Name",
  },
  {
    key: "tree_level_3_id",
    name: "Tree level 3 ID",
  },
  {
    formula: true,
    key: "tree_level_3_name",
    name: "Tree level 3 Name",
  },
  {
    key: "tree_level_4_id",
    name: "Tree level 4 ID",
  },
  {
    formula: true,
    key: "tree_level_4_name",
    name: "Tree level 4 Name",
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
