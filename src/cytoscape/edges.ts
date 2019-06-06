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
    key: "source_node_rendering_mode",
    name: "source_node_rendering_mode",
  },
  {
    formula: true,
    key: "source_is_container_and_interaction_is_member",
    name: "source_is_container_and_interaction_is_member",
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
  {
    formula: true,
    key: "source_aligned_tree_aggregated_node_hours",
    name: "source_aligned_tree_aggregated_node_hours",
  },
  {
    formula: true,
    key: "source_area",
    name: "source_area",
  },
  {
    formula: true,
    key: "source_tree_aggregated_node_hours",
    name: "source_tree_aggregated_node_hours",
  },
  {
    formula: true,
    key: "source_aligned_tree_aggregated_node_hours",
    name: "source_aligned_tree_aggregated_node_hours",
  },
  {
    formula: true,
    key: "source_tree_aggregated_node_hours_one_hop_away",
    name: "source_tree_aggregated_node_hours_one_hop_away",
  },
  {
    formula: true,
    key: "source_aligned_tree_aggregated_node_hours_one_hop_away",
    name: "source_aligned_tree_aggregated_node_hours_one_hop_away",
  },
  {
    formula: true,
    key: "edge_aggregated_hours",
    name: "edge_aggregated_hours",
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
