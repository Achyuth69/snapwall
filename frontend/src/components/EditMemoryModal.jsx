import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Country, State, City } from "country-state-city";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./AddMemoryModal.css";

const EditMemoryModal = ({ memory, onClose, onSave }) => {
  const [caption, setCaption] = useState(memory.caption);
  const [countryCode, setCountryCode] = useState(
    Country.getAllCountries().find(c => c.name === memory.country)?.isoCode || ""
  );
  const [stateCode, setStateCode] = useState(
    State.getStatesOfCountry(countryCode)
      .find(s => s.name === memory.state)?.isoCode || ""
  );
  const [city, setCity] = useState(memory.city);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      const updatedData = {
        caption,
        country: Country.getCountryByCode(countryCode)?.name,
        state: State.getStateByCodeAndCountry(stateCode, countryCode)?.name,
        city
      };

      await updateDoc(doc(db, "memories", memory.id), updatedData);

      onSave({ ...memory, ...updatedData });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="memory-overlay">
      <div className="memory-modal-ui">
        <FaTimes className="close-icon" onClick={onClose} />
        <h2>Edit Memory</h2>

        <textarea
          className="gradient-input caption-box"
          maxLength={60}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div className="char-count">{caption.length} / 60</div>

        <select
          className="gradient-input"
          value={countryCode}
          onChange={(e) => {
            setCountryCode(e.target.value);
            setStateCode("");
            setCity("");
          }}
        >
          <option value="">Country</option>
          {Country.getAllCountries().map(c => (
            <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
          ))}
        </select>

        <select
          className="gradient-input"
          value={stateCode}
          disabled={!countryCode}
          onChange={(e) => {
            setStateCode(e.target.value);
            setCity("");
          }}
        >
          <option value="">State</option>
          {State.getStatesOfCountry(countryCode).map(s => (
            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
          ))}
        </select>

        <select
          className="gradient-input"
          value={city}
          disabled={!stateCode}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">City</option>
          {City.getCitiesOfState(countryCode, stateCode).map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>

        <button className="post-btn" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditMemoryModal;
