export interface TreeNode {
  indentation: number;
  group: boolean;
}

export type Tree<T extends TreeNode> = T & {
  children?: Tree<T>[];
};

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
