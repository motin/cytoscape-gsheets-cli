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
    key: "visible",
    name: "Visible",
  },
  {
    formula: true,
    key: "node_rendering_mode",
    name: "node_rendering_mode",
  },
  {
    formula: true,
    key: "area",
    name: "Area",
  },
  {
    formula: true,
    key: "diameter",
    name: "Diameter",
  },
  {
    formula: true,
    key: "size",
    name: "Size",
  },
  {
    formula: true,
    key: "label",
    name: "Label",
  },
  {
    formula: true,
    key: "obfuscated_label",
    name: "Obfuscated Label",
  },
  {
    formula: true,
    key: "label_width",
    name: "Label Width",
  },
  {
    formula: true,
    key: "label_font_size",
    name: "Label font size",
  },
  {
    formula: true,
    key: "label_width",
    name: "Label width",
  },
  {
    formula: true,
    key: "SUID", // Always exported by cytoscape in capital letters
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
  {
    formula: true,
    key: "unaggregated_node_hours",
    name: "unaggregated_node_hours",
  },
  {
    formula: true,
    key: "level1_children_unaggregated_node_hours",
    name: "level1_children_unaggregated_node_hours",
  },
  {
    formula: true,
    key: "level2_children_unaggregated_node_hours",
    name: "level2_children_unaggregated_node_hours",
  },
  {
    formula: true,
    key: "level3_children_unaggregated_node_hours",
    name: "level3_children_unaggregated_node_hours",
  },
  {
    formula: true,
    key: "children_unaggregated_node_hours",
    name: "children_unaggregated_node_hours",
  },
  {
    formula: true,
    key: "parent_distributed_node_hours",
    name: "parent_distributed_node_hours",
  },
  {
    formula: true,
    key: "tree_aggregated_node_hours",
    name: "tree_aggregated_node_hours",
  },
  {
    formula: true,
    key: "edge_aggregated_hours",
    name: "edge_aggregated_hours",
  },
  {
    formula: true,
    key: "level1_children_edge_aggregated_node_hours",
    name: "level1_children_edge_aggregated_node_hours",
  },
  {
    formula: true,
    key: "level2_children_edge_aggregated_node_hours",
    name: "level2_children_edge_aggregated_node_hours",
  },
  {
    formula: true,
    key: "level3_children_edge_aggregated_node_hours",
    name: "level3_children_edge_aggregated_node_hours",
  },
  {
    formula: true,
    key: "aggregated_node_hours",
    name: "aggregated_node_hours",
  },
  {
    formula: true,
    key: "hours_percentage",
    name: "hours_percentage",
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
