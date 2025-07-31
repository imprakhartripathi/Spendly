import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, ArrowDownRight } from "lucide-react";
import axios from "axios";
import { backendURL } from "../../app.config";
import "./SearchAutocomplete.scss";

interface Transaction {
  _id: string;
  transectionType: "debit" | "credit";
  amount: number;
  spentOn: string;
  spentOnDesc: string;
  onDate: string;
  category: string;
}

interface SearchAutocompleteProps {
  user: any;
  onTransactionSelect: (transaction: Transaction) => void;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  user,
  onTransactionSelect
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Transaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  }, [searchTerm]);

  const performSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendURL}/user/${user._id}/search/transections?query=${encodeURIComponent(searchTerm)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSearchResults(response.data.transections);
      setIsOpen(true);
    } catch (error) {
      console.error("Error searching transactions:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    onTransactionSelect(transaction);
    setIsOpen(false);
    setSearchTerm("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="search-autocomplete" ref={searchRef}>
      <div className="search-input-container">
        <Search size={18} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.trim() && setIsOpen(true)}
        />
        {loading && (
          <div className="search-loading">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            className="search-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="search-results-header">
              <span>{searchResults.length} transaction{searchResults.length !== 1 ? 's' : ''} found</span>
            </div>
            <div className="search-results">
              {searchResults.map((transaction, index) => (
                <motion.div
                  key={transaction._id}
                  className="search-result-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="transaction-icon">
                    <div className={`icon-wrapper ${transaction.transectionType}`}>
                      {transaction.transectionType === 'debit' ? 
                        <ArrowDownRight size={16} /> : 
                        <ArrowUpRight size={16} />
                      }
                    </div>
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-title">{transaction.spentOn}</div>
                    <div className="transaction-meta">
                      {transaction.category} • {formatDate(transaction.onDate)}
                    </div>
                    <div className="transaction-description">{transaction.spentOnDesc}</div>
                  </div>
                  <div className={`transaction-amount ${transaction.transectionType}`}>
                    {transaction.transectionType === 'debit' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && searchTerm.trim() && searchResults.length === 0 && !loading && (
          <motion.div
            className="search-dropdown no-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="no-results-message">
              No transactions found for "{searchTerm}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAutocomplete;