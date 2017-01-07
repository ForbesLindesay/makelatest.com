function Button(props) {
  if (props.to) {
    return <Link {...props} />;
  } else if (props.href) {
    return <a {...props} />;
  } else {
    return <button {...props} />;
  }
}

export default styled(Button)`
  background: white;
  color: palevioletred;
  display: inline-block;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 0.75em;
  border: 2px solid palevioletred;
  border-radius: 3px;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  &:hover {
    background: palevioletred;
    color: white;
  }
  &:disabled {
    background: #e6e6e6;
    color: #baabb0;
    border-color: #baabb0;
    cursor: auto;
  }
`;
