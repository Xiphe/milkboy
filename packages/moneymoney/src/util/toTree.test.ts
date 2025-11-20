import { describe, it } from "@std/testing/bdd";
import { assertObjectMatch } from "@std/assert";
import { toTree, type TreeNode } from "./index.ts";

describe("toTree", () => {
  it("builds a simple flat tree with no children", () => {
    const nodes: (TreeNode & { uuid: string })[] = [
      {
        uuid: "1",
        indentation: 0,
        group: true,
      },
      {
        uuid: "2",
        indentation: 0,
        group: true,
      },
    ];

    assertTree(toTree(nodes), [{ uuid: "1" }, { uuid: "2" }]);
  });

  it("builds a tree with children at indentation level 1", () => {
    const nodes: (TreeNode & { uuid: string })[] = [
      {
        uuid: "1",
        indentation: 0,
        group: true,
      },
      {
        uuid: "2",
        indentation: 1,
        group: false,
      },
    ];

    assertTree(toTree(nodes), [{ uuid: "1", children: [{ uuid: "2" }] }]);
  });

  it("handles multiple levels of nesting", () => {
    const nodes: (TreeNode & { uuid: string })[] = [
      {
        uuid: "1",
        indentation: 0,
        group: true,
      },
      {
        uuid: "2",
        indentation: 1,
        group: true,
      },
      {
        uuid: "3",
        indentation: 2,
        group: false,
      },
    ];

    assertTree(toTree(nodes), [
      { uuid: "1", children: [{ uuid: "2", children: [{ uuid: "3" }] }] },
    ]);
  });

  it("handles going back up the tree when indentation decreases", () => {
    const nodes: (TreeNode & { uuid: string })[] = [
      {
        uuid: "1",
        indentation: 0,
        group: true,
      },
      {
        uuid: "2",
        indentation: 1,
        group: false,
      },
      {
        uuid: "3",
        indentation: 0,
        group: true,
      },
      {
        uuid: "4",
        indentation: 1,
        group: true,
      },
      {
        uuid: "5",
        indentation: 2,
        group: true,
      },
      {
        uuid: "6",
        indentation: 0,
        group: false,
      },
    ];

    assertTree(toTree(nodes), [
      { uuid: "1", children: [{ uuid: "2" }] },
      { uuid: "3", children: [{ uuid: "4", children: [{ uuid: "5" }] }] },
      { uuid: "6" },
    ]);
  });
});

type UuidTree = {
  uuid: string;
  children?: UuidTree[];
};

function assertTree(tree: TreeNode[], expected: UuidTree[]) {
  assertObjectMatch({ tree }, { tree: expected });
}
