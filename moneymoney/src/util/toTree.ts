/**
 * A node with indentation and group information
 */
export interface TreeNode {
  indentation: number;
  group: boolean;
}

/**
 * Tree structure for a list of items
 * works with account and category lists
 */
export type Tree<T extends TreeNode> = T & {
  children?: Tree<T>[];
};

/**
 * Builds a tree structure from flat list of accounts or categories
 *
 * @param items - List of items to build the tree from
 * @returns {Tree<T>[]} Tree structure
 *
 * @example
 * ```typescript
 * import { getAccounts } from "@xph/moneymoney";
 * import { toTree } from "@xph/moneymoney/util";
 *
 * const accounts = await getAccounts();
 * const tree = toTree(accounts);
 * ```
 */
export function toTree<T extends TreeNode>(items: T[]): Tree<T>[] {
  const result: Tree<T>[] = [];
  const stack: Tree<T>[] = [];

  for (const item of items) {
    // Find the parent level in the stack based on indentation
    while (
      stack.length > 0 &&
      stack[stack.length - 1].indentation >= item.indentation
    ) {
      stack.pop();
    }

    const node: Tree<T> = { ...item };

    if (stack.length === 0) {
      // Top-level node
      result.push(node);
    } else {
      // Child node - add to parent's children
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(node);
    }

    // Add groups to stack for potential children
    if (item.group) {
      stack.push(node);
    }
  }

  return result;
}
