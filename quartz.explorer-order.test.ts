import assert from "node:assert/strict"
import { test } from "node:test"
import {
  compareArticleSequence,
  getArticleSequence,
  isNumberedArticle,
  type SequenceEntry,
} from "./quartz.explorer-order"

const entry = (slugSegment: string): SequenceEntry => ({ slugSegment })

test("sorts articles by numeric sequence descending", () => {
  const nodes = [151, 149, 100, 99, 21, 20, 19, 10, 9, 2, 1]
    .map((number) => entry(`${number}-article`))
    .reverse()

  assert.deepEqual(
    nodes.sort(compareArticleSequence).map((node) => node.slugSegment),
    [
      "151-article",
      "149-article",
      "100-article",
      "99-article",
      "21-article",
      "20-article",
      "19-article",
      "10-article",
      "9-article",
      "2-article",
      "1-article",
    ],
  )
})

test("uses deterministic structural-slug ties for duplicate sequences", () => {
  const nodes = [
    entry("24-things"),
    entry("23-shadowing"),
    entry("24-connecting"),
    entry("23-pytip"),
  ].reverse()

  assert.deepEqual(
    nodes.sort(compareArticleSequence).map((node) => node.slugSegment),
    ["24-connecting", "24-things", "23-pytip", "23-shadowing"],
  )
})

test("recognizes dashed and dotted articles while excluding site pages", () => {
  assert.equal(getArticleSequence("21-google-cloud-storage/index"), 21)
  assert.equal(getArticleSequence("20.gatsby-theme-features/index"), 20)
  assert.equal(getArticleSequence("19.changing-gatsby-colors-manually/index"), 19)
  assert.equal(isNumberedArticle("til/index"), false)
  assert.equal(isNumberedArticle("bio/index"), false)
})
