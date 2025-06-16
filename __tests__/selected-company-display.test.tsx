import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectedCompanyDisplay from '@/app/components/selected-company-display';

describe('SelectedCompanyDisplay', () => {
  const mockCompany = {
    name: 'Test Company',
    address: '123 Test St, Test City, TS 12345',
    phone: '123-456-7890',
  };

  const mockOnEdit = jest.fn();

  it('renders company information', () => {
    render(<SelectedCompanyDisplay company={mockCompany} onEdit={mockOnEdit} />);
    
    expect(screen.getByText(mockCompany.name)).toBeInTheDocument();
    expect(screen.getByText(mockCompany.address)).toBeInTheDocument();
    expect(screen.getByText(`📞 ${mockCompany.phone}`)).toBeInTheDocument();
  });

  it('calls onEdit when the change button is clicked', () => {
    render(<SelectedCompanyDisplay company={mockCompany} onEdit={mockOnEdit} />);
    
    const changeButton = screen.getByRole('button', { name: /change/i });
    fireEvent.click(changeButton);
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('renders without a phone number', () => {
    const companyWithoutPhone = { ...mockCompany, phone: undefined };
    render(<SelectedCompanyDisplay company={companyWithoutPhone} onEdit={mockOnEdit} />);
    
    expect(screen.getByText(companyWithoutPhone.name)).toBeInTheDocument();
    expect(screen.queryByText(/📞/)).not.toBeInTheDocument();
  });
}); 