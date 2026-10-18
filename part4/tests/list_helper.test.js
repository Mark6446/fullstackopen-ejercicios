const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const blogs = [
    { title: 'React patterns', author: 'Michael Chan', likes: 7 },
    { title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 5 },
    { title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 }
  ]

  test('of empty list is zero', () => {
    assert.strictEqual(listHelper.totalLikes([]), 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    assert.strictEqual(listHelper.totalLikes(blogs), 24)
  })
})

describe('favorite blog', () => {
  const blogs = [
    { title: 'React patterns', author: 'Michael Chan', likes: 7 },
    { title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 5 },
    { title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 }
  ]

  test('returns the blog with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    
    assert.deepStrictEqual(result, {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    })
  })
})

describe('most blogs', () => {
  const blogs = [
    { title: 'React patterns', author: 'Michael Chan', likes: 7 },
    { title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 5 },
    { title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 },
    { title: 'First class tests', author: 'Robert C. Martin', likes: 10 },
    { title: 'TDD harms architecture', author: 'Robert C. Martin', likes: 0 },
    { title: 'Type wars', author: 'Robert C. Martin', likes: 2 }
  ]

  test('returns the author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    
    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})

describe('most likes', () => {
  const blogs = [
    { title: 'React patterns', author: 'Michael Chan', likes: 7 },
    { title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 5 },
    { title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 },
    { title: 'First class tests', author: 'Robert C. Martin', likes: 10 },
    { title: 'TDD harms architecture', author: 'Robert C. Martin', likes: 0 },
    { title: 'Type wars', author: 'Robert C. Martin', likes: 2 }
  ]

  test('returns the author with most total likes', () => {
    const result = listHelper.mostLikes(blogs)
    
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})