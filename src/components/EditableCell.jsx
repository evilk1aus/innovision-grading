import { useState } from 'react';

const EditableCell = ({ value, onSave, editable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const onClick = () => {
    if (!editable) {
      return;
    }
    setIsEditing(true);
  }
  const handleKeyDown = (e) => {
    if (e.key == 'Enter') {
      handleBlur();
    }
  }
  const handleChange = (e) => setInputValue(e.target.value);
  const handleBlur = () => {
    setIsEditing(false);
    onSave(inputValue);
  };

  return isEditing && editable ? (
    <input className={"w-full px-4 py-2"} type="text" value={inputValue} onKeyDown={handleKeyDown} onChange={handleChange} onBlur={handleBlur} autoFocus />
  ) : (
	  <div className={"w-full px-4 py-2"} onClick={onClick} style={editable ? {cursor:'pointer'} : {}}>
	    <span className={"w-full"}>{value}</span>
	  </div>
  );
}

export default EditableCell;
