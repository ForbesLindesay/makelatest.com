export default styled.div`
  display: flex;
  flex-direction: ${props => props.flexDirection || 'column'};
  flex-grow: ${props => props.flexGrow || null};
  align-content: ${props => props.alignContent || 'stretch'};
  align-items: ${props => props.alignItems || 'stretch'};
  justify-content: ${props => props.justifyContent || 'stretch'};
`;
