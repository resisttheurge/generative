export const nav = {
  flex: 1,
  textAlign: 'center',
  fontSize: [1, 2, 3],
  p: [0, 3],
  color: 'gray',
  borderBottomStyle: 'solid',
  borderBottomColor: 'gray',
  borderBottomWidth: '4px',
  '&.active': {
    color: 'text',
    borderBottomColor: 'text'
  },
  '&:hover': {
    color: 'accent',
    borderBottomColor: 'accent'
  }
}
