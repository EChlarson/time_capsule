function add(a, b) {
  return a + b;
}

test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3); 
});

it('adds 5 + 10 to equal 15', () => {
  expect(add(5, 10)).toBe(15);
});